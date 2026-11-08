import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/appointments
 * Public endpoint for patient booking form
 */
router.post('/', (req: Request, res: Response): Promise<void> => {
  const { patient_name, phone, email, service_requested, preferred_date, preferred_time, notes } = req.body;

  if (!patient_name || !phone || !service_requested || !preferred_date) {
    res.status(400).json({
      error: 'Missing Required Fields',
      message: 'Please provide patient name, phone number, service requested, and preferred date.',
    });
    return Promise.resolve();
  }

  // Basic sanitization
  const cleanName = String(patient_name).trim();
  const cleanPhone = String(phone).trim();
  const cleanEmail = email ? String(email).trim() : null;
  const cleanService = String(service_requested).trim();
  const cleanDate = String(preferred_date).trim();
  const cleanTime = preferred_time ? String(preferred_time).trim() : 'Morning';
  const cleanNotes = notes ? String(notes).trim() : null;

  try {
    const stmt = db.prepare(`
      INSERT INTO appointments (patient_name, phone, email, service_requested, preferred_date, preferred_time, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    const result = stmt.run(
      cleanName,
      cleanPhone,
      cleanEmail,
      cleanService,
      cleanDate,
      cleanTime,
      cleanNotes
    );

    const newAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);

    console.log(`[Appointment] New booking created: #${result.lastInsertRowid} for ${cleanName} (${cleanService})`);

    res.status(201).json({
      success: true,
      message: 'Your appointment request has been submitted successfully! Our care coordinator will call to confirm shortly.',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error('[Appointment Error] Insert failed:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to record appointment. Please call the clinic directly.',
    });
  }

  return Promise.resolve();
});

/**
 * GET /api/appointments
 * Protected admin endpoint to fetch appointments
 * Supports query params: status, search
 */
router.get('/', requireAdminAuth, (req: Request, res: Response) => {
  const { status, search } = req.query;

  let query = 'SELECT * FROM appointments WHERE 1=1';
  const params: any[] = [];

  if (status && typeof status === 'string' && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    query += ' AND (patient_name LIKE ? OR phone LIKE ? OR service_requested LIKE ? OR email LIKE ?)';
    const searchPattern = `%${search.trim()}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  query += ' ORDER BY id DESC';

  try {
    const appointments = db.prepare(query).all(...params);
    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error('[Appointment Error] Query failed:', error);
    res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
});

/**
 * GET /api/appointments/stats
 * Protected admin endpoint for summary statistics
 */
router.get('/stats', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const total = (db.prepare('SELECT COUNT(*) as count FROM appointments').get() as any).count;
    const pending = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'").get() as any).count;
    const confirmed = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'confirmed'").get() as any).count;
    const completed = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'").get() as any).count;
    const cancelled = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'").get() as any).count;

    res.json({
      success: true,
      stats: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
      },
    });
  } catch (error) {
    console.error('[Stats Error]:', error);
    res.status(500).json({ error: 'Failed to fetch appointment statistics' });
  }
});

/**
 * PUT /api/appointments/:id
 * Protected admin endpoint to update status or details
 */
router.put('/:id', requireAdminAuth, (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, preferred_date, preferred_time, notes, service_requested } = req.body;

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  if (!appt) {
    res.status(404).json({ error: 'Appointment not found' });
    return Promise.resolve();
  }

  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({
      error: 'Invalid status',
      message: `Status must be one of: ${validStatuses.join(', ')}`,
    });
    return Promise.resolve();
  }

  try {
    const newStatus = status ?? (appt as any).status;
    const newDate = preferred_date ?? (appt as any).preferred_date;
    const newTime = preferred_time ?? (appt as any).preferred_time;
    const newNotes = notes !== undefined ? notes : (appt as any).notes;
    const newService = service_requested ?? (appt as any).service_requested;

    db.prepare(`
      UPDATE appointments
      SET status = ?, preferred_date = ?, preferred_time = ?, notes = ?, service_requested = ?
      WHERE id = ?
    `).run(newStatus, newDate, newTime, newNotes, newService, id);

    const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);

    res.json({
      success: true,
      message: `Appointment #${id} updated successfully.`,
      appointment: updated,
    });
  } catch (error) {
    console.error('[Appointment Update Error]:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }

  return Promise.resolve();
});

/**
 * DELETE /api/appointments/:id
 * Protected admin endpoint to delete an appointment
 */
router.delete('/:id', requireAdminAuth, (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  if (!appt) {
    res.status(404).json({ error: 'Appointment not found' });
    return Promise.resolve();
  }

  try {
    db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
    res.json({
      success: true,
      message: `Appointment #${id} removed successfully.`,
    });
  } catch (error) {
    console.error('[Appointment Delete Error]:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }

  return Promise.resolve();
});

export default router;
