import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

import { MongoClient } from 'mongodb';

const inventory = [
  { name: 'Whole Milk', quantity: 48, unit: 'gallon', price: 3.99, category: 'Dairy', createdAt: new Date() },
  { name: 'Large Eggs', quantity: 120, unit: 'dozen', price: 4.49, category: 'Dairy', createdAt: new Date() },
  { name: 'Sourdough Bread', quantity: 30, unit: 'loaf', price: 5.99, category: 'Bakery', createdAt: new Date() },
  { name: 'Unsalted Butter', quantity: 6, unit: 'lb', price: 6.49, category: 'Dairy', createdAt: new Date() },
  { name: 'Sharp Cheddar', quantity: 22, unit: 'lb', price: 8.99, category: 'Dairy', createdAt: new Date() },
  { name: 'Gala Apples', quantity: 80, unit: 'lb', price: 1.49, category: 'Produce', createdAt: new Date() },
  { name: 'Navel Oranges', quantity: 3, unit: 'lb', price: 1.29, category: 'Produce', createdAt: new Date() },
  { name: 'Jasmine Rice', quantity: 15, unit: 'lb', price: 2.99, category: 'Grains', createdAt: new Date() },
  { name: 'Penne Pasta', quantity: 40, unit: 'lb', price: 1.79, category: 'Grains', createdAt: new Date() },
  { name: 'Canned Tomatoes', quantity: 7, unit: 'can', price: 1.19, category: 'Canned Goods', createdAt: new Date() },
];

const now = new Date();
const d = (offsetDays) => new Date(now.getTime() + offsetDays * 86400000);

const orders = [
  { customerName: 'Sarah Chen', items: [{ name: 'Whole Milk', qty: 2 }, { name: 'Large Eggs', qty: 1 }], total: 12.47, status: 'completed', createdAt: d(-5) },
  { customerName: 'Marcus Rivera', items: [{ name: 'Sourdough Bread', qty: 3 }, { name: 'Unsalted Butter', qty: 1 }], total: 24.46, status: 'completed', createdAt: d(-4) },
  { customerName: 'Priya Patel', items: [{ name: 'Sharp Cheddar', qty: 2 }, { name: 'Whole Milk', qty: 1 }], total: 21.97, status: 'pending', createdAt: d(-2) },
  { customerName: 'James O\'Brien', items: [{ name: 'Jasmine Rice', qty: 5 }, { name: 'Canned Tomatoes', qty: 4 }], total: 19.71, status: 'pending', createdAt: d(-1) },
  { customerName: 'Aisha Williams', items: [{ name: 'Gala Apples', qty: 3 }, { name: 'Navel Oranges', qty: 2 }], total: 7.05, status: 'completed', createdAt: d(-3) },
  { customerName: 'Tom Nguyen', items: [{ name: 'Penne Pasta', qty: 4 }, { name: 'Canned Tomatoes', qty: 6 }], total: 14.30, status: 'cancelled', createdAt: d(-6) },
  { customerName: 'Linda Park', items: [{ name: 'Large Eggs', qty: 2 }, { name: 'Sourdough Bread', qty: 1 }], total: 14.97, status: 'pending', createdAt: d(0) },
  { customerName: 'David Kim', items: [{ name: 'Sharp Cheddar', qty: 1 }, { name: 'Unsalted Butter', qty: 2 }], total: 21.97, status: 'pending', createdAt: d(0) },
];

const appointments = [
  { customerName: 'Sarah Chen', service: 'Weekly Grocery Pickup', date: '2026-05-14', time: '10:00', status: 'scheduled', createdAt: d(-7) },
  { customerName: 'Marcus Rivera', service: 'Bulk Order Consultation', date: '2026-05-14', time: '14:00', status: 'scheduled', createdAt: d(-5) },
  { customerName: 'Priya Patel', service: 'Weekly Grocery Pickup', date: '2026-05-15', time: '09:30', status: 'scheduled', createdAt: d(-4) },
  { customerName: 'James O\'Brien', service: 'Catering Order Review', date: '2026-05-16', time: '11:00', status: 'scheduled', createdAt: d(-3) },
  { customerName: 'Aisha Williams', service: 'Weekly Grocery Pickup', date: '2026-05-12', time: '15:00', status: 'completed', createdAt: d(-10) },
  { customerName: 'Tom Nguyen', service: 'Delivery Setup', date: '2026-05-13', time: '13:00', status: 'cancelled', createdAt: d(-8) },
];

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to MongoDB. Seeding...');

    await db.collection('inventory').deleteMany({});
    await db.collection('orders').deleteMany({});
    await db.collection('appointments').deleteMany({});

    const inv = await db.collection('inventory').insertMany(inventory);
    const ord = await db.collection('orders').insertMany(orders);
    const apt = await db.collection('appointments').insertMany(appointments);

    console.log(`Inserted: ${inv.insertedCount} inventory, ${ord.insertedCount} orders, ${apt.insertedCount} appointments`);
    console.log('Seed complete.');
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
