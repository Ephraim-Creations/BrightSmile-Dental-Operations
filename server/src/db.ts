import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { hashPassword } from './utils/crypto.js';
import { wasmBinaryBuffer } from './wasm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wasmBinary = wasmBinaryBuffer.buffer.slice(
  wasmBinaryBuffer.byteOffset,
  wasmBinaryBuffer.byteOffset + wasmBinaryBuffer.byteLength
) as ArrayBuffer;

const SQL = await initSqlJs({
  wasmBinary,
});

// Database file path
let dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../dental_clinic.sqlite');

if (process.env.VERCEL && !process.env.DATABASE_PATH) {
  const tmpDbPath = path.join('/tmp', 'dental_clinic.sqlite');
  try {
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, tmpDbPath);
    }
  } catch (err) {
    console.warn('[Database] Could not copy SQLite database to /tmp:', err);
  }
  dbPath = tmpDbPath;
}

// Load existing database file if exists
let sqliteInstance: any;
try {
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    sqliteInstance = new SQL.Database(fileBuffer);
  } else {
    sqliteInstance = new SQL.Database();
  }
} catch {
  sqliteInstance = new SQL.Database();
}

function persist() {
  try {
    const data = sqliteInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    // Read-only filesystem or temporary error fallback
  }
}

export interface RunResult {
  lastInsertRowid: number;
  changes: number;
}

export class StatementWrapper {
  constructor(private sql: string, private sqlDb: any) {}

  get(...params: any[]): any {
    const flatParams = params.flat();
    const stmt = this.sqlDb.prepare(this.sql);
    try {
      if (flatParams.length > 0) {
        stmt.bind(flatParams);
      }
      if (stmt.step()) {
        const obj = stmt.getAsObject();
        return obj;
      }
      return undefined;
    } finally {
      stmt.free();
    }
  }

  all(...params: any[]): any[] {
    const flatParams = params.flat();
    const stmt = this.sqlDb.prepare(this.sql);
    const results: any[] = [];
    try {
      if (flatParams.length > 0) {
        stmt.bind(flatParams);
      }
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      return results;
    } finally {
      stmt.free();
    }
  }

  run(...params: any[]): RunResult {
    const flatParams = params.flat();
    if (flatParams.length > 0) {
      this.sqlDb.run(this.sql, flatParams);
    } else {
      this.sqlDb.run(this.sql);
    }
    const changes = this.sqlDb.getRowsModified();
    let lastInsertRowid = 0;
    try {
      const idRes = this.sqlDb.exec('SELECT last_insert_rowid() as id');
      if (idRes.length > 0 && idRes[0].values.length > 0) {
        lastInsertRowid = Number(idRes[0].values[0][0]);
      }
    } catch {}

    persist();
    return { lastInsertRowid, changes };
  }
}

export const db = {
  pragma(_str: string) {
    try {
      sqliteInstance.exec(`PRAGMA ${_str};`);
    } catch {}
  },
  exec(sql: string) {
    sqliteInstance.exec(sql);
    persist();
  },
  prepare(sql: string) {
    return new StatementWrapper(sql, sqliteInstance);
  },
};

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      otp_code TEXT,
      otp_expires_at INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      service_requested TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_reference TEXT NOT NULL,
      image_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clinic_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      working_hours TEXT NOT NULL,
      email TEXT NOT NULL,
      announcement TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(preferred_date);
    CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
  `);

  // Migration: ensure password_hash column exists
  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
  } catch {
    // Column already exists
  }

  seedInitialData();
}

function seedInitialData() {
  const AUTHORIZED_ADMIN = 'ephraimcreations254@gmail.com';
  const initialPasswordHash = hashPassword('12345678');

  // Seed authorized admin user with initial password '12345678'
  const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(AUTHORIZED_ADMIN) as { id: number; email: string; password_hash?: string } | undefined;
  if (!user) {
    db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(AUTHORIZED_ADMIN, initialPasswordHash, 'admin');
    console.log(`[Database] Seeded authorized admin user: ${AUTHORIZED_ADMIN} with default credentials`);
  } else if (!user.password_hash) {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(initialPasswordHash, user.id);
    console.log(`[Database] Initialized default password for admin: ${AUTHORIZED_ADMIN}`);
  }

  // Seed default clinic settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT INTO settings (clinic_name, phone, address, working_hours, email, announcement)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'BrightSmile Dental Clinic',
      '(555) 123-4567',
      '123 Smiles Ave, Los Angeles, CA 90001',
      'Mon - Sat: 8:00 AM - 6:00 PM',
      'contact@brightsmile.com',
      'New Patient Special: Get 15% Off on Your First Visit!'
    );
    console.log('[Database] Seeded default clinic settings.');
  }

  // Seed 6 core services matching reference images
  const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
  if (servicesCount.count === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (title, description, icon_reference, image_url, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);

    const defaultServices = [
      {
        title: 'General Dentistry',
        description: 'Routine checkups, digital diagnostics, professional cleanings, and preventive care for a lifelong healthy smile.',
        icon_reference: 'Tooth',
        image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Cosmetic Dentistry',
        description: 'Advanced laser teeth whitening, handcrafted porcelain veneers, and complete smile makeovers to enhance your confidence.',
        icon_reference: 'Sparkles',
        image_url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Dental Implants',
        description: 'State-of-the-art permanent solutions for missing teeth that look, feel, and function just like your natural teeth.',
        icon_reference: 'ShieldCheck',
        image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Orthodontics',
        description: 'Straighten misaligned teeth with clear Invisalign aligners or modern ceramic braces for adolescents and adults.',
        icon_reference: 'Smile',
        image_url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Pediatric Dentistry',
        description: 'Gentle, friendly, and compassionate dental care specially tailored for infants, children, and teens in a playful setting.',
        icon_reference: 'HeartHandshake',
        image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Emergency Care',
        description: 'Fast, immediate relief and prompt same-day treatments for sudden toothaches, trauma, broken crowns, or dental emergencies.',
        icon_reference: 'Clock',
        image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80'
      }
    ];

    for (const service of defaultServices) {
      insertService.run(service.title, service.description, service.icon_reference, service.image_url);
    }
    console.log('[Database] Seeded 6 core dental services.');
  }

  // Seed sample initial appointments for realistic dashboard display
  const appointmentsCount = db.prepare('SELECT COUNT(*) as count FROM appointments').get() as { count: number };
  if (appointmentsCount.count === 0) {
    const insertAppt = db.prepare(`
      INSERT INTO appointments (patient_name, phone, email, service_requested, preferred_date, preferred_time, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleAppointments = [
      {
        patient_name: 'Sarah Jenkins',
        phone: '(310) 555-0192',
        email: 'sarah.j@example.com',
        service_requested: 'General Dentistry',
        preferred_date: '2026-11-12',
        preferred_time: '10:00 AM',
        notes: 'Routine 6-month checkup and gentle ultrasonic cleaning.',
        status: 'confirmed'
      },
      {
        patient_name: 'Michael Torres',
        phone: '(213) 555-8371',
        email: 'mtorres@example.com',
        service_requested: 'Cosmetic Dentistry',
        preferred_date: '2026-11-14',
        preferred_time: '02:00 PM',
        notes: 'Interested in in-office zoom teeth whitening before upcoming wedding.',
        status: 'pending'
      },
      {
        patient_name: 'Emily Chen',
        phone: '(424) 555-4920',
        email: 'echen@example.com',
        service_requested: 'Orthodontics',
        preferred_date: '2026-11-15',
        preferred_time: '11:30 AM',
        notes: 'Consultation for clear aligners.',
        status: 'pending'
      },
      {
        patient_name: 'David Reynolds',
        phone: '(818) 555-7319',
        email: 'david.r@example.com',
        service_requested: 'Dental Implants',
        preferred_date: '2026-11-09',
        preferred_time: '09:00 AM',
        notes: 'Lower molar implant consultation.',
        status: 'confirmed'
      },
      {
        patient_name: 'Liam & Jessica Patel',
        phone: '(626) 555-2481',
        email: 'patelfam@example.com',
        service_requested: 'Pediatric Dentistry',
        preferred_date: '2026-11-16',
        preferred_time: '03:30 PM',
        notes: 'First dental visit for 5-year-old son.',
        status: 'pending'
      }
    ];

    for (const appt of sampleAppointments) {
      insertAppt.run(
        appt.patient_name,
        appt.phone,
        appt.email,
        appt.service_requested,
        appt.preferred_date,
        appt.preferred_time,
        appt.notes,
        appt.status
      );
    }
    console.log('[Database] Seeded sample appointments for admin management.');
  }
}
