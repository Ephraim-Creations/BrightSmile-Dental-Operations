import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/settings
 * Public endpoint to fetch clinic settings
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    let settings = db.prepare('SELECT * FROM settings ORDER BY id ASC LIMIT 1').get();

    if (!settings) {
      settings = {
        clinic_name: 'BrightSmile Dental Clinic',
        phone: '(555) 123-4567',
        address: '123 Smiles Ave, Los Angeles, CA 90001',
        working_hours: 'Mon - Sat: 8:00 AM - 6:00 PM',
        email: 'contact@brightsmile.com',
        announcement: 'New Patient Special: Get 15% Off on Your First Visit!',
      };
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('[Settings Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve clinic settings' });
  }
});

/**
 * PUT /api/settings
 * Protected admin endpoint to update clinic settings
 */
router.put('/', requireAdminAuth, (req: Request, res: Response): Promise<void> => {
  const { clinic_name, phone, address, working_hours, email, announcement } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM settings ORDER BY id ASC LIMIT 1').get() as { id: number } | undefined;

    if (!existing) {
      db.prepare(`
        INSERT INTO settings (clinic_name, phone, address, working_hours, email, announcement)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        clinic_name || 'BrightSmile Dental Clinic',
        phone || '(555) 123-4567',
        address || '123 Smiles Ave, Los Angeles, CA 90001',
        working_hours || 'Mon - Sat: 8:00 AM - 6:00 PM',
        email || 'contact@brightsmile.com',
        announcement || 'New Patient Special: Get 15% Off on Your First Visit!'
      );
    } else {
      db.prepare(`
        UPDATE settings
        SET clinic_name = COALESCE(?, clinic_name),
            phone = COALESCE(?, phone),
            address = COALESCE(?, address),
            working_hours = COALESCE(?, working_hours),
            email = COALESCE(?, email),
            announcement = COALESCE(?, announcement)
        WHERE id = ?
      `).run(
        clinic_name ?? null,
        phone ?? null,
        address ?? null,
        working_hours ?? null,
        email ?? null,
        announcement ?? null,
        existing.id
      );
    }

    const updated = db.prepare('SELECT * FROM settings ORDER BY id ASC LIMIT 1').get();

    res.json({
      success: true,
      message: 'Clinic settings updated successfully.',
      settings: updated,
    });
  } catch (error) {
    console.error('[Settings Update Error]:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }

  return Promise.resolve();
});

export default router;
