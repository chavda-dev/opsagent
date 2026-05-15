import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const inventory = [
  {
    "name": "Sushi Rice",
    "category": "Grains & Pulses",
    "quantity": 22,
    "unit": "unit",
    "price": 4.5,
    "supplier": "Jaxnation",
    "reorderLevel": 72,
    "status": "Discontinued"
  },
  {
    "name": "Arabica Coffee",
    "category": "Beverages",
    "quantity": 45,
    "unit": "unit",
    "price": 20.0,
    "supplier": "Feedmix",
    "reorderLevel": 77,
    "status": "Discontinued"
  },
  {
    "name": "Black Rice",
    "category": "Grains & Pulses",
    "quantity": 30,
    "unit": "unit",
    "price": 6.0,
    "supplier": "Vinder",
    "reorderLevel": 38,
    "status": "Backordered"
  },
  {
    "name": "Long Grain Rice",
    "category": "Grains & Pulses",
    "quantity": 12,
    "unit": "unit",
    "price": 1.5,
    "supplier": "Brightbean",
    "reorderLevel": 59,
    "status": "Active"
  },
  {
    "name": "Plum",
    "category": "Fruits & Vegetables",
    "quantity": 37,
    "unit": "unit",
    "price": 4.0,
    "supplier": "Topicstorm",
    "reorderLevel": 30,
    "status": "Backordered"
  },
  {
    "name": "All-Purpose Flour",
    "category": "Grains & Pulses",
    "quantity": 55,
    "unit": "unit",
    "price": 1.75,
    "supplier": "Dabjam",
    "reorderLevel": 33,
    "status": "Discontinued"
  },
  {
    "name": "Corn Oil",
    "category": "Oils & Fats",
    "quantity": 96,
    "unit": "unit",
    "price": 2.5,
    "supplier": "Tagfeed",
    "reorderLevel": 52,
    "status": "Active"
  },
  {
    "name": "Egg (Goose)",
    "category": "Dairy",
    "quantity": 44,
    "unit": "unit",
    "price": 2.5,
    "supplier": "Muxo",
    "reorderLevel": 90,
    "status": "Discontinued"
  },
  {
    "name": "Greek Yogurt",
    "category": "Dairy",
    "quantity": 91,
    "unit": "unit",
    "price": 3.0,
    "supplier": "Thoughtstorm",
    "reorderLevel": 84,
    "status": "Active"
  },
  {
    "name": "Egg (Duck)",
    "category": "Dairy",
    "quantity": 43,
    "unit": "unit",
    "price": 1.0,
    "supplier": "Wordify",
    "reorderLevel": 10,
    "status": "Active"
  },
  {
    "name": "Long Grain Rice",
    "category": "Grains & Pulses",
    "quantity": 62,
    "unit": "unit",
    "price": 1.6,
    "supplier": "Fivebridge",
    "reorderLevel": 81,
    "status": "Discontinued"
  },
  {
    "name": "White Sugar",
    "category": "Grains & Pulses",
    "quantity": 91,
    "unit": "unit",
    "price": 2.0,
    "supplier": "Zooxo",
    "reorderLevel": 98,
    "status": "Backordered"
  },
  {
    "name": "Rye Bread",
    "category": "Bakery",
    "quantity": 26,
    "unit": "unit",
    "price": 3.0,
    "supplier": "Vitz",
    "reorderLevel": 79,
    "status": "Discontinued"
  },
  {
    "name": "Plum",
    "category": "Fruits & Vegetables",
    "quantity": 95,
    "unit": "unit",
    "price": 4.0,
    "supplier": "Voomm",
    "reorderLevel": 50,
    "status": "Active"
  },
  {
    "name": "Strawberries",
    "category": "Fruits & Vegetables",
    "quantity": 54,
    "unit": "unit",
    "price": 6.0,
    "supplier": "Babblestorm",
    "reorderLevel": 26,
    "status": "Active"
  },
  {
    "name": "Feta Cheese",
    "category": "Dairy",
    "quantity": 94,
    "unit": "unit",
    "price": 7.0,
    "supplier": "Youfeed",
    "reorderLevel": 13,
    "status": "Backordered"
  },
  {
    "name": "Bread Flour",
    "category": "Grains & Pulses",
    "quantity": 27,
    "unit": "unit",
    "price": 1.5,
    "supplier": "Mynte",
    "reorderLevel": 93,
    "status": "Active"
  },
  {
    "name": "Swiss Cheese",
    "category": "Dairy",
    "quantity": 49,
    "unit": "unit",
    "price": 8.0,
    "supplier": "Reallinks",
    "reorderLevel": 49,
    "status": "Discontinued"
  },
  {
    "name": "Arabica Coffee",
    "category": "Beverages",
    "quantity": 55,
    "unit": "unit",
    "price": 20.0,
    "supplier": "Skivee",
    "reorderLevel": 93,
    "status": "Active"
  },
  {
    "name": "White Sugar",
    "category": "Grains & Pulses",
    "quantity": 65,
    "unit": "unit",
    "price": 2.0,
    "supplier": "Mydeo",
    "reorderLevel": 61,
    "status": "Backordered"
  },
  {
    "name": "Spinach",
    "category": "Fruits & Vegetables",
    "quantity": 72,
    "unit": "unit",
    "price": 2.5,
    "supplier": "Devshare",
    "reorderLevel": 70,
    "status": "Discontinued"
  },
  {
    "name": "Trout",
    "category": "Seafood",
    "quantity": 49,
    "unit": "unit",
    "price": 12.0,
    "supplier": "Jabbertype",
    "reorderLevel": 73,
    "status": "Active"
  },
  {
    "name": "Green Beans",
    "category": "Fruits & Vegetables",
    "quantity": 81,
    "unit": "unit",
    "price": 2.0,
    "supplier": "Gigazoom",
    "reorderLevel": 99,
    "status": "Discontinued"
  },
  {
    "name": "Cabbage",
    "category": "Fruits & Vegetables",
    "quantity": 88,
    "unit": "unit",
    "price": 1.0,
    "supplier": "Chatterbridge",
    "reorderLevel": 46,
    "status": "Active"
  },
  {
    "name": "Parmesan Cheese",
    "category": "Dairy",
    "quantity": 63,
    "unit": "unit",
    "price": 12.0,
    "supplier": "Feedspan",
    "reorderLevel": 4,
    "status": "Active"
  },
  {
    "name": "Raw Sugar",
    "category": "Grains & Pulses",
    "quantity": 31,
    "unit": "unit",
    "price": 1.5,
    "supplier": "Mydo",
    "reorderLevel": 43,
    "status": "Backordered"
  },
  {
    "name": "Egg (Quail)",
    "category": "Dairy",
    "quantity": 97,
    "unit": "unit",
    "price": 0.8,
    "supplier": "Realpoint",
    "reorderLevel": 88,
    "status": "Discontinued"
  },
  {
    "name": "Mushrooms",
    "category": "Fruits & Vegetables",
    "quantity": 72,
    "unit": "unit",
    "price": 6.0,
    "supplier": "Photospace",
    "reorderLevel": 87,
    "status": "Active"
  },
  {
    "name": "Oatmeal Biscuit",
    "category": "Bakery",
    "quantity": 16,
    "unit": "unit",
    "price": 5.0,
    "supplier": "Gigazoom",
    "reorderLevel": 9,
    "status": "Backordered"
  },
  {
    "name": "Pear",
    "category": "Fruits & Vegetables",
    "quantity": 77,
    "unit": "unit",
    "price": 4.5,
    "supplier": "Centizu",
    "reorderLevel": 20,
    "status": "Discontinued"
  },
  {
    "name": "Cucumber",
    "category": "Fruits & Vegetables",
    "quantity": 19,
    "unit": "unit",
    "price": 1.75,
    "supplier": "Brainverse",
    "reorderLevel": 36,
    "status": "Backordered"
  },
  {
    "name": "Pineapple",
    "category": "Fruits & Vegetables",
    "quantity": 18,
    "unit": "unit",
    "price": 3.5,
    "supplier": "Photojam",
    "reorderLevel": 52,
    "status": "Backordered"
  },
  {
    "name": "Olive Oil",
    "category": "Oils & Fats",
    "quantity": 47,
    "unit": "unit",
    "price": 6.0,
    "supplier": "Kamba",
    "reorderLevel": 48,
    "status": "Discontinued"
  },
  {
    "name": "Herbal Tea",
    "category": "Beverages",
    "quantity": 77,
    "unit": "unit",
    "price": 30.0,
    "supplier": "Pixonyx",
    "reorderLevel": 45,
    "status": "Discontinued"
  },
  {
    "name": "Haddock",
    "category": "Seafood",
    "quantity": 46,
    "unit": "unit",
    "price": 9.0,
    "supplier": "Midel",
    "reorderLevel": 28,
    "status": "Discontinued"
  },
  {
    "name": "Onion",
    "category": "Fruits & Vegetables",
    "quantity": 39,
    "unit": "unit",
    "price": 2.0,
    "supplier": "Skyble",
    "reorderLevel": 22,
    "status": "Active"
  },
  {
    "name": "Sushi Rice",
    "category": "Grains & Pulses",
    "quantity": 75,
    "unit": "unit",
    "price": 4.5,
    "supplier": "Linklinks",
    "reorderLevel": 69,
    "status": "Backordered"
  },
  {
    "name": "Pineapple",
    "category": "Fruits & Vegetables",
    "quantity": 48,
    "unit": "unit",
    "price": 3.45,
    "supplier": "Flipbug",
    "reorderLevel": 48,
    "status": "Discontinued"
  },
  {
    "name": "Zucchini",
    "category": "Fruits & Vegetables",
    "quantity": 61,
    "unit": "unit",
    "price": 2.5,
    "supplier": "Kare",
    "reorderLevel": 90,
    "status": "Discontinued"
  },
  {
    "name": "Short Grain Rice",
    "category": "Grains & Pulses",
    "quantity": 60,
    "unit": "unit",
    "price": 3.0,
    "supplier": "Snaptags",
    "reorderLevel": 90,
    "status": "Discontinued"
  },
  {
    "name": "Mango",
    "category": "Fruits & Vegetables",
    "quantity": 24,
    "unit": "unit",
    "price": 5.0,
    "supplier": "Twitternation",
    "reorderLevel": 55,
    "status": "Discontinued"
  },
  {
    "name": "Lemon",
    "category": "Fruits & Vegetables",
    "quantity": 12,
    "unit": "unit",
    "price": 2.3,
    "supplier": "Layo",
    "reorderLevel": 7,
    "status": "Discontinued"
  },
  {
    "name": "Black Coffee",
    "category": "Beverages",
    "quantity": 84,
    "unit": "unit",
    "price": 15.0,
    "supplier": "Realpoint",
    "reorderLevel": 13,
    "status": "Backordered"
  },
  {
    "name": "Butter",
    "category": "Dairy",
    "quantity": 51,
    "unit": "unit",
    "price": 3.0,
    "supplier": "Kayveo",
    "reorderLevel": 100,
    "status": "Discontinued"
  },
  {
    "name": "Multigrain Bread",
    "category": "Bakery",
    "quantity": 65,
    "unit": "unit",
    "price": 3.5,
    "supplier": "Roombo",
    "reorderLevel": 36,
    "status": "Backordered"
  },
  {
    "name": "Long Grain Rice",
    "category": "Grains & Pulses",
    "quantity": 67,
    "unit": "unit",
    "price": 1.5,
    "supplier": "Voonyx",
    "reorderLevel": 88,
    "status": "Discontinued"
  },
  {
    "name": "Bread Flour",
    "category": "Grains & Pulses",
    "quantity": 14,
    "unit": "unit",
    "price": 1.5,
    "supplier": "Browsezoom",
    "reorderLevel": 74,
    "status": "Discontinued"
  },
  {
    "name": "Kiwi",
    "category": "Fruits & Vegetables",
    "quantity": 45,
    "unit": "unit",
    "price": 6.0,
    "supplier": "Fiveclub",
    "reorderLevel": 24,
    "status": "Backordered"
  },
  {
    "name": "Mango",
    "category": "Fruits & Vegetables",
    "quantity": 92,
    "unit": "unit",
    "price": 5.0,
    "supplier": "Skipfire",
    "reorderLevel": 46,
    "status": "Discontinued"
  },
  {
    "name": "Sourdough Bread",
    "category": "Bakery",
    "quantity": 41,
    "unit": "unit",
    "price": 4.0,
    "supplier": "Flashspan",
    "reorderLevel": 84,
    "status": "Active"
  }
];

const orders = [
  {
    "customer": "Raj Patel",
    "items": [
      {
        "name": "Corn Oil",
        "quantity": 3,
        "price": 2.5
      },
      {
        "name": "Feta Cheese",
        "quantity": 5,
        "price": 7.0
      },
      {
        "name": "Bread Flour",
        "quantity": 5,
        "price": 1.5
      }
    ],
    "total": 50.0,
    "status": "completed",
    "date": "2026-05-05"
  },
  {
    "customer": "Vikram Singh",
    "items": [
      {
        "name": "Pineapple",
        "quantity": 1,
        "price": 3.5
      },
      {
        "name": "Black Rice",
        "quantity": 4,
        "price": 6.0
      }
    ],
    "total": 27.5,
    "status": "cancelled",
    "date": "2026-05-06"
  },
  {
    "customer": "Priya Shah",
    "items": [
      {
        "name": "Butter",
        "quantity": 1,
        "price": 3.0
      },
      {
        "name": "Green Beans",
        "quantity": 2,
        "price": 2.0
      },
      {
        "name": "Spinach",
        "quantity": 4,
        "price": 2.5
      },
      {
        "name": "Multigrain Bread",
        "quantity": 1,
        "price": 3.5
      }
    ],
    "total": 20.5,
    "status": "completed",
    "date": "2026-05-09"
  },
  {
    "customer": "Pooja Gupta",
    "items": [
      {
        "name": "Kiwi",
        "quantity": 5,
        "price": 6.0
      },
      {
        "name": "Rye Bread",
        "quantity": 1,
        "price": 3.0
      },
      {
        "name": "Onion",
        "quantity": 4,
        "price": 2.0
      },
      {
        "name": "Arabica Coffee",
        "quantity": 3,
        "price": 20.0
      }
    ],
    "total": 101.0,
    "status": "pending",
    "date": "2026-05-11"
  },
  {
    "customer": "Priya Shah",
    "items": [
      {
        "name": "Corn Oil",
        "quantity": 3,
        "price": 2.5
      }
    ],
    "total": 7.5,
    "status": "completed",
    "date": "2026-05-03"
  },
  {
    "customer": "Priya Shah",
    "items": [
      {
        "name": "Sourdough Bread",
        "quantity": 5,
        "price": 4.0
      },
      {
        "name": "Cabbage",
        "quantity": 3,
        "price": 1.0
      },
      {
        "name": "Raw Sugar",
        "quantity": 2,
        "price": 1.5
      }
    ],
    "total": 26.0,
    "status": "completed",
    "date": "2026-05-03"
  },
  {
    "customer": "Meena Reddy",
    "items": [
      {
        "name": "Butter",
        "quantity": 3,
        "price": 3.0
      }
    ],
    "total": 9.0,
    "status": "completed",
    "date": "2026-05-08"
  },
  {
    "customer": "Sameer Khan",
    "items": [
      {
        "name": "White Sugar",
        "quantity": 5,
        "price": 2.0
      },
      {
        "name": "Pineapple",
        "quantity": 3,
        "price": 3.45
      },
      {
        "name": "Olive Oil",
        "quantity": 4,
        "price": 6.0
      },
      {
        "name": "Sushi Rice",
        "quantity": 3,
        "price": 4.5
      }
    ],
    "total": 57.85,
    "status": "pending",
    "date": "2026-05-10"
  },
  {
    "customer": "Anita Desai",
    "items": [
      {
        "name": "Mushrooms",
        "quantity": 1,
        "price": 6.0
      }
    ],
    "total": 6.0,
    "status": "completed",
    "date": "2026-05-05"
  },
  {
    "customer": "Rohit Mehta",
    "items": [
      {
        "name": "Pear",
        "quantity": 2,
        "price": 4.5
      },
      {
        "name": "Haddock",
        "quantity": 5,
        "price": 9.0
      },
      {
        "name": "Green Beans",
        "quantity": 5,
        "price": 2.0
      },
      {
        "name": "Sourdough Bread",
        "quantity": 4,
        "price": 4.0
      }
    ],
    "total": 80.0,
    "status": "completed",
    "date": "2026-05-08"
  },
  {
    "customer": "Rohit Mehta",
    "items": [
      {
        "name": "Onion",
        "quantity": 4,
        "price": 2.0
      },
      {
        "name": "Long Grain Rice",
        "quantity": 2,
        "price": 1.5
      },
      {
        "name": "Mango",
        "quantity": 2,
        "price": 5.0
      }
    ],
    "total": 21.0,
    "status": "completed",
    "date": "2026-05-10"
  },
  {
    "customer": "Amit Kumar",
    "items": [
      {
        "name": "Rye Bread",
        "quantity": 5,
        "price": 3.0
      },
      {
        "name": "Strawberries",
        "quantity": 5,
        "price": 6.0
      }
    ],
    "total": 45.0,
    "status": "pending",
    "date": "2026-05-15"
  },
  {
    "customer": "Deepa Verma",
    "items": [
      {
        "name": "Cabbage",
        "quantity": 4,
        "price": 1.0
      }
    ],
    "total": 4.0,
    "status": "pending",
    "date": "2026-05-14"
  },
  {
    "customer": "Kiran Bose",
    "items": [
      {
        "name": "Cucumber",
        "quantity": 5,
        "price": 1.75
      },
      {
        "name": "Pineapple",
        "quantity": 1,
        "price": 3.45
      },
      {
        "name": "Arabica Coffee",
        "quantity": 5,
        "price": 20.0
      },
      {
        "name": "Haddock",
        "quantity": 4,
        "price": 9.0
      }
    ],
    "total": 148.2,
    "status": "completed",
    "date": "2026-05-01"
  },
  {
    "customer": "Meena Reddy",
    "items": [
      {
        "name": "Cucumber",
        "quantity": 4,
        "price": 1.75
      },
      {
        "name": "Pineapple",
        "quantity": 4,
        "price": 3.5
      }
    ],
    "total": 21.0,
    "status": "pending",
    "date": "2026-05-06"
  },
  {
    "customer": "Kavita Nair",
    "items": [
      {
        "name": "White Sugar",
        "quantity": 5,
        "price": 2.0
      },
      {
        "name": "Sourdough Bread",
        "quantity": 2,
        "price": 4.0
      }
    ],
    "total": 18.0,
    "status": "pending",
    "date": "2026-05-01"
  },
  {
    "customer": "Kavita Nair",
    "items": [
      {
        "name": "Plum",
        "quantity": 5,
        "price": 4.0
      },
      {
        "name": "Long Grain Rice",
        "quantity": 4,
        "price": 1.5
      },
      {
        "name": "Rye Bread",
        "quantity": 2,
        "price": 3.0
      },
      {
        "name": "Herbal Tea",
        "quantity": 1,
        "price": 30.0
      }
    ],
    "total": 62.0,
    "status": "completed",
    "date": "2026-05-12"
  },
  {
    "customer": "Suresh Iyer",
    "items": [
      {
        "name": "Butter",
        "quantity": 5,
        "price": 3.0
      },
      {
        "name": "Rye Bread",
        "quantity": 4,
        "price": 3.0
      },
      {
        "name": "Bread Flour",
        "quantity": 1,
        "price": 1.5
      },
      {
        "name": "Long Grain Rice",
        "quantity": 1,
        "price": 1.5
      }
    ],
    "total": 30.0,
    "status": "pending",
    "date": "2026-05-09"
  },
  {
    "customer": "Pooja Gupta",
    "items": [
      {
        "name": "Feta Cheese",
        "quantity": 2,
        "price": 7.0
      },
      {
        "name": "Egg (Goose)",
        "quantity": 5,
        "price": 2.5
      },
      {
        "name": "Haddock",
        "quantity": 4,
        "price": 9.0
      }
    ],
    "total": 62.5,
    "status": "completed",
    "date": "2026-05-08"
  },
  {
    "customer": "Suresh Iyer",
    "items": [
      {
        "name": "Black Rice",
        "quantity": 4,
        "price": 6.0
      }
    ],
    "total": 24.0,
    "status": "completed",
    "date": "2026-05-10"
  }
];

const appointments = [
  {
    "customer": "Kavita Nair",
    "purpose": "Pickup",
    "date": "2026-05-23",
    "time": "10:00",
    "status": "cancelled",
    "notes": ""
  },
  {
    "customer": "Priya Shah",
    "purpose": "Return",
    "date": "2026-05-18",
    "time": "16:30",
    "status": "cancelled",
    "notes": ""
  },
  {
    "customer": "Arjun Sharma",
    "purpose": "Complaint",
    "date": "2026-05-21",
    "time": "12:30",
    "status": "completed",
    "notes": ""
  },
  {
    "customer": "Sneha Joshi",
    "purpose": "Pickup",
    "date": "2026-05-17",
    "time": "09:30",
    "status": "scheduled",
    "notes": ""
  },
  {
    "customer": "Kiran Bose",
    "purpose": "Delivery",
    "date": "2026-05-18",
    "time": "11:00",
    "status": "completed",
    "notes": ""
  },
  {
    "customer": "Kiran Bose",
    "purpose": "Delivery",
    "date": "2026-05-23",
    "time": "12:30",
    "status": "completed",
    "notes": ""
  },
  {
    "customer": "Anita Desai",
    "purpose": "Return",
    "date": "2026-05-20",
    "time": "17:00",
    "status": "completed",
    "notes": ""
  },
  {
    "customer": "Meena Reddy",
    "purpose": "Pickup",
    "date": "2026-05-22",
    "time": "09:00",
    "status": "completed",
    "notes": ""
  },
  {
    "customer": "Sameer Khan",
    "purpose": "Bulk Order",
    "date": "2026-05-20",
    "time": "11:30",
    "status": "completed",
    "notes": ""
  },
  {
    "customer": "Priya Shah",
    "purpose": "Bulk Order",
    "date": "2026-05-18",
    "time": "14:30",
    "status": "completed",
    "notes": ""
  },
  {
    "customer": "Kavita Nair",
    "purpose": "Return",
    "date": "2026-05-24",
    "time": "14:30",
    "status": "scheduled",
    "notes": ""
  },
  {
    "customer": "Priya Shah",
    "purpose": "Complaint",
    "date": "2026-05-15",
    "time": "16:30",
    "status": "cancelled",
    "notes": ""
  },
  {
    "customer": "Priya Shah",
    "purpose": "Bulk Order",
    "date": "2026-05-17",
    "time": "11:00",
    "status": "scheduled",
    "notes": ""
  },
  {
    "customer": "Suresh Iyer",
    "purpose": "Return",
    "date": "2026-05-16",
    "time": "11:00",
    "status": "completed",
    "notes": ""
  },
  {
    "customer": "Rohit Mehta",
    "purpose": "Pickup",
    "date": "2026-05-15",
    "time": "17:30",
    "status": "cancelled",
    "notes": ""
  }
];

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  console.log('Connected to MongoDB. Seeding...');
  const db = client.db('opsagent');
  
  await db.collection('inventory').deleteMany({});
  await db.collection('orders').deleteMany({});
  await db.collection('appointments').deleteMany({});
  
  await db.collection('inventory').insertMany(inventory);
  await db.collection('orders').insertMany(orders);
  await db.collection('appointments').insertMany(appointments);
  
  console.log(`Inserted: ${inventory.length} inventory, ${orders.length} orders, ${appointments.length} appointments`);
  console.log('Seed complete.');
  await client.close();
}

seed().catch(console.error);
