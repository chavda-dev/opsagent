import { MongoClient } from 'mongodb';

let db = null;
let client = null;

export async function connectDB() {
  if (db) return db;
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db('opsagent');
  console.log('Connected to MongoDB Atlas');
  return db;
}

export function getDB() {
  if (!db) throw new Error('Database not initialized. Call connectDB first.');
  return db;
}

export async function closeDB() {
  if (client) await client.close();
}
