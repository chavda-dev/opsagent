import { getDB } from '../db/client.js';
import { ObjectId } from 'mongodb';

export async function executePlan(plan) {
  const db = getDB();
  const col = db.collection(plan.collection);
  const p = plan.parameters || {};

  switch (plan.intent) {
    case 'read': {
      const filter = buildFilter(p);
      const limit = p.limit ? parseInt(p.limit) : 100;
      const docs = await col.find(filter).limit(limit).toArray();
      return { docs, count: docs.length };
    }

    case 'create': {
      const doc = buildDoc(p);
      const result = await col.insertOne(doc);
      return { insertedId: result.insertedId, doc };
    }

    case 'update': {
      const filter = buildFilter(p.filter || {});
      const updateFields = { ...(p.update || {}), updatedAt: new Date() };
      const result = await col.updateMany(filter, { $set: updateFields });
      return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
    }

    case 'delete': {
      const filter = buildFilter(p.filter || p);
      const result = await col.deleteMany(filter);
      return { deletedCount: result.deletedCount };
    }

    case 'summary': {
      const total = await col.countDocuments();
      const recent = await col.find({}).sort({ createdAt: -1 }).limit(5).toArray();

      // collection-specific aggregations
      if (plan.collection === 'inventory') {
        const lowStock = await col.countDocuments({ quantity: { $lt: 10 } });
        return { total, lowStock, recent };
      }
      if (plan.collection === 'orders') {
        const pending = await col.countDocuments({ status: 'pending' });
        const completed = await col.countDocuments({ status: 'completed' });
        return { total, pending, completed, recent };
      }
      if (plan.collection === 'appointments') {
        const scheduled = await col.countDocuments({ status: 'scheduled' });
        return { total, scheduled, recent };
      }
      return { total, recent };
    }

    default:
      throw new Error(`Unknown intent: "${plan.intent}"`);
  }
}

function buildFilter(params) {
  const filter = {};
  for (const [key, value] of Object.entries(params)) {
    if (key === 'limit') continue;
    if (key === '_id') {
      filter._id = new ObjectId(value);
    } else if (typeof value === 'string' && /[*?]/.test(value)) {
      filter[key] = { $regex: value.replace(/\*/g, '.*').replace(/\?/g, '.'), $options: 'i' };
    } else {
      filter[key] = value;
    }
  }
  return filter;
}

function buildDoc(params) {
  const doc = {};
  for (const [key, value] of Object.entries(params)) {
    if (key === 'limit') continue;
    doc[key] = value;
  }
  doc.createdAt = new Date();
  return doc;
}
