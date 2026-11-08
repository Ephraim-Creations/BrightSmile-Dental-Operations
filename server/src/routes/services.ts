import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/services
 * Public endpoint to fetch active services (or all services with ?all=true for admin)
 */
router.get('/', (req: Request, res: Response) => {
  const { all } = req.query;

  try {
    let services;
    if (all === 'true') {
      services = db.prepare('SELECT * FROM services ORDER BY id ASC').all();
    } else {
      services = db.prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY id ASC').all();
    }

    res.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error('[Services Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve services' });
  }
});

/**
 * POST /api/services
 * Protected admin endpoint to create a new service
 */
router.post('/', requireAdminAuth, (req: Request, res: Response): Promise<void> => {
  const { title, description, icon_reference, image_url, is_active } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'Title and description are required' });
    return Promise.resolve();
  }

  try {
    const icon = icon_reference || 'Tooth';
    const active = is_active === undefined ? 1 : (is_active ? 1 : 0);
    const img = image_url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80';

    const result = db.prepare(`
      INSERT INTO services (title, description, icon_reference, image_url, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(title.trim(), description.trim(), icon, img, active);

    const created = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      service: created,
    });
  } catch (error) {
    console.error('[Service Create Error]:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }

  return Promise.resolve();
});

/**
 * PUT /api/services/:id
 * Protected admin endpoint to update a service
 */
router.put('/:id', requireAdminAuth, (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, icon_reference, image_url, is_active } = req.body;

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!service) {
    res.status(404).json({ error: 'Service not found' });
    return Promise.resolve();
  }

  try {
    const current = service as any;
    const newTitle = title !== undefined ? String(title).trim() : current.title;
    const newDesc = description !== undefined ? String(description).trim() : current.description;
    const newIcon = icon_reference !== undefined ? String(icon_reference).trim() : current.icon_reference;
    const newImg = image_url !== undefined ? String(image_url).trim() : current.image_url;
    const newActive = is_active !== undefined ? (is_active ? 1 : 0) : current.is_active;

    db.prepare(`
      UPDATE services
      SET title = ?, description = ?, icon_reference = ?, image_url = ?, is_active = ?
      WHERE id = ?
    `).run(newTitle, newDesc, newIcon, newImg, newActive, id);

    const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Service updated successfully.',
      service: updated,
    });
  } catch (error) {
    console.error('[Service Update Error]:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }

  return Promise.resolve();
});

/**
 * DELETE /api/services/:id
 * Protected admin endpoint to delete a service
 */
router.delete('/:id', requireAdminAuth, (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!service) {
    res.status(404).json({ error: 'Service not found' });
    return Promise.resolve();
  }

  try {
    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    res.json({
      success: true,
      message: 'Service deleted successfully.',
    });
  } catch (error) {
    console.error('[Service Delete Error]:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }

  return Promise.resolve();
});

export default router;
