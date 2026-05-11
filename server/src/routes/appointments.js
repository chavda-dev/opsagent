import { Router } from 'express';
import { getDB } from '../db/client.js';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const appts = await getDB().collection('appointments').find({}).sort({ date: 1 }).toArray();
    res.json(appts);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const doc = { ...req.body, status: req.body.status || 'scheduled', createdAt: new Date() };
    const result = await getDB().collection('appointments').insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const result = await getDB().collection('appointments').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Appointment not found' });
    res.json(result);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await getDB().collection('appointments').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

export default router;
