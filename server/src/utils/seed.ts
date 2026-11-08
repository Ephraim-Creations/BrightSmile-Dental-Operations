import { initDatabase } from '../db.js';

console.log('Seeding SQLite database...');
initDatabase();
console.log('Database initialized and seeded successfully.');
process.exit(0);
