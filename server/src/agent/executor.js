import { getDB } from '../db/client.js';
import { ObjectId } from 'mongodb';

export async function executePlan(plan) {
  const db = getDB();
  const col = db.collection(plan.collection);
  const p = plan.parameters || {};

  switch (plan.intent) {
    case 'query': {
      const filter = buildFilter(p);
      const limit = p.limit ? parseInt(p.limit) : 50;
      const docs = await col.find(filter).limit(limit).toArray();
      return { docs, count: docs.length };
    }

    case 'create': {
      const doc = { ...p, createdAt: new Date() };
      delete doc.limit;
      const result = await col.insertOne(doc);
      return { insertedId: result.insertedId, doc };
    }

    case 'update': {
      const filter = p._id ? { _id: new ObjectId(p._id) } : buildFilter(p.filter || {});
      const update = { $set: { ...p.update, updatedAt: new Date() } };
      const result = await col.updateMany(filter, update);
      return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
    }

    case 'delete': {
      const filter = p._id ? { _id: new ObjectId(p._id) } : buildFilter(p);
      const result = await col.deleteMany(filter);
      return { deletedCount: result.deletedCount };
    }

    case 'summary': {
      const total = await col.countDocuments();
      const recent = await col.find({}).sort({ createdAt: -1 }).limit(5).toArray();
      return { total, recent };
    }

    default:
      throw new Error(`Unknown intent: ${plan.intent}`);
  }
}

function buildFilter(params) {
  const filter = {};
  for (const [key, value] of Object.entries(params)) {
    if (key === 'limit' || key === 'filter' || key === 'update') continue;
    if (key === '_id') {
      filter._id = new ObjectId(value);
    } else if (typeof value === 'string' && value.includes('*')) {
      filter[key] = { $regex: value.replace(/\*/g, '.*'), $options: 'i' };
    } else {
      filter[key] = value;
    }
  }
  return filter;
}
