import { Router } from 'express';
import { db } from '../db/index.js';
import { instances } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const instancesRouter = Router();

// Create new instance
instancesRouter.post('/create', async (req, res) => {
  const { name, phoneNumberId, accessToken, verifyToken, webhookUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    if (!db) throw new Error('Database not connected');
    const result = await db.insert(instances).values({
      name,
      phoneNumberId,
      accessToken,
      verifyToken,
      webhookUrl,
      status: 'offline' // default status until verified or configured
    }).returning();
    
    return res.json(result[0]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Fetch all instances
instancesRouter.get('/fetchInstances', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const allInstances = await db.select().from(instances);
    return res.json(allInstances);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Fetch specific instance
instancesRouter.get('/fetchInstances/:name', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const result = await db.select().from(instances).where(eq(instances.name, req.params.name));
    if (result.length === 0) return res.status(404).json({ error: 'Instance not found' });
    return res.json(result[0]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Update instance config
instancesRouter.post('/settings/:name', async (req, res) => {
  const { webhookUrl, chatwootUrl, chatwootAccountId, chatwootToken, phoneNumberId, accessToken, verifyToken } = req.body;
  
  try {
    if (!db) throw new Error('Database not connected');
    const result = await db.update(instances)
      .set({ 
        webhookUrl, chatwootUrl, chatwootAccountId, chatwootToken,
        phoneNumberId, accessToken, verifyToken,
        updatedAt: new Date()
      })
      .where(eq(instances.name, req.params.name))
      .returning();
      
    if (result.length === 0) return res.status(404).json({ error: 'Instance not found' });
    return res.json(result[0]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete Instance
instancesRouter.delete('/delete/:name', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const result = await db.delete(instances).where(eq(instances.name, req.params.name)).returning();
    if (result.length === 0) return res.status(404).json({ error: 'Instance not found' });
    return res.json({ success: true, message: 'Instance deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
