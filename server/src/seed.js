import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import MenuItem from './models/MenuItem.js';
import GroceryItem from './models/GroceryItem.js';
import Order from './models/Order.js';
import Reservation from './models/Reservation.js';

dotenv.config();
await connectDB();

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const seed = async () => {
  try {
    await Promise.all([
      User.deleteMany(),
      Restaurant.deleteMany(),
      MenuItem.deleteMany(),
      GroceryItem.deleteMany(),
      Order.deleteMany(),
      Reservation.deleteMany()
    ]);

    await User.create({
      name: 'DineMart Admin',
      email: 'admin@example.com',
      password: 'admin12345',
      role: 'admin',
      phone: '0300-0000001',
      address: 'DineMart Head Office'
    });

    await User.create({
      name: 'Demo Customer',
      email: 'customer@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '0300-1111111',
      address: 'House 12, Main Street, Islamabad'
    });

    await User.create({
      name: 'Ali Rider',
      email: 'rider@example.com',
      password: 'rider12345',
      role: 'rider',
      phone: '0312-5554444',
      address: 'Rider Zone A'
    });

    await User.create({
      name: 'Sara Delivery',
      email: 'rider2@example.com',
      password: 'rider12345',
      role: 'rider',
      phone: '0321-7778888',
      address: 'Rider Zone B'
    });

    const restaurants = await Restaurant.insertMany([
      {
        name: 'Urban Grill House',
        cuisine: 'Burgers • Steaks • Fries',
        image: photo('photo-1555396273-367ea4eb4db5'),
        rating: 4.7,
        deliveryTime: 35,
        deliveryFee: 150,
        address: 'Blue Area, Islamabad'
      },
      {
        name: 'Pasta Palace',
        cuisine: 'Italian • Pasta • Bakery',
        image: photo('photo-1517248135467-4c7edcad34c4'),
        rating: 4.6,
        deliveryTime: 40,
        deliveryFee: 180,
        address: 'F-7 Markaz, Islamabad'
      },
      {
        name: 'Desi Dawat',
        cuisine: 'Pakistani • Biryani • Karahi',
        image: photo('photo-1552566626-52f8b828add9'),
        rating: 4.8,
        deliveryTime: 45,
        deliveryFee: 160,
        address: 'Saddar, Rawalpindi'
      }
    ]);

    const [grill, pasta, desi] = restaurants;

    await MenuItem.insertMany([
      {
        restaurant: grill._id,
        name: 'Classic Beef Burger',
        category: 'Burgers',
        price: 750,
        description: 'Juicy beef patty with melted cheese, lettuce and signature sauce.',
        image: photo('photo-1568901346375-23c9450c58cd'),
        prepTime: 20
      },
      {
        restaurant: grill._id,
        name: 'Chicken Loaded Fries',
        category: 'Sides',
        price: 520,
        description: 'Crispy fries topped with chicken, cheese sauce and herbs.',
        image: photo('photo-1573080496219-bb080dd4f877'),
        prepTime: 12
      },
      {
        restaurant: grill._id,
        name: 'Mint Margarita',
        category: 'Drinks',
        price: 250,
        description: 'Fresh mint, lemon and crushed ice.',
        image: photo('photo-1497534446932-c925b458314e'),
        prepTime: 5
      },
      {
        restaurant: pasta._id,
        name: 'Alfredo Pasta',
        category: 'Pasta',
        price: 880,
        description: 'Creamy alfredo pasta with grilled chicken and parmesan.',
        image: photo('photo-1551183053-bf91a1d81141'),
        prepTime: 22
      },
      {
        restaurant: pasta._id,
        name: 'Lasagna',
        category: 'Italian',
        price: 990,
        description: 'Layered pasta with rich meat sauce and baked cheese.',
        image: photo('photo-1574894709920-11b28e7367e3'),
        prepTime: 25
      },
      {
        restaurant: pasta._id,
        name: 'Garlic Bread',
        category: 'Sides',
        price: 320,
        description: 'Toasted garlic bread with butter and herbs.',
        image: photo('photo-1608198093002-ad4e005484ec'),
        prepTime: 10
      },
      {
        restaurant: desi._id,
        name: 'Chicken Biryani',
        category: 'Rice',
        price: 420,
        description: 'Spiced chicken biryani served with raita.',
        image: photo('photo-1563379091339-03246963d96c'),
        prepTime: 18
      },
      {
        restaurant: desi._id,
        name: 'Chicken Karahi Half',
        category: 'Karahi',
        price: 1450,
        description: 'Traditional chicken karahi cooked with tomatoes, ginger and spices.',
        image: photo('photo-1585937421612-70a008356fbe'),
        prepTime: 30
      },
      {
        restaurant: desi._id,
        name: 'Tandoori Naan',
        category: 'Bread',
        price: 60,
        description: 'Fresh tandoori naan served hot.',
        image: photo('photo-1601050690597-df0568f70950'),
        prepTime: 5
      }
    ]);

    await GroceryItem.insertMany([
      { name: 'Milk Pack 1 Liter', category: 'Dairy', price: 280, unit: '1 liter', stock: 60, image: photo('photo-1563636619-e9143da7973b') },
      { name: 'Eggs Dozen', category: 'Dairy', price: 420, unit: '12 pcs', stock: 40, image: photo('photo-1587486913049-53fc88980cfc') },
      { name: 'Cheddar Cheese', category: 'Dairy', price: 650, unit: '250g', stock: 25, image: photo('photo-1486297678162-eb2a19b0a32d') },
      { name: 'Bananas', category: 'Fruits & Vegetables', price: 220, unit: 'dozen', stock: 35, image: photo('photo-1571771894821-ce9b6c11b08e') },
      { name: 'Tomatoes', category: 'Fruits & Vegetables', price: 180, unit: 'kg', stock: 30, image: photo('photo-1592924357228-91a4daadcfea') },
      { name: 'Potatoes', category: 'Fruits & Vegetables', price: 130, unit: 'kg', stock: 45, image: photo('photo-1518977676601-b53f82aba655') },
      { name: 'Cooking Oil 1 Liter', category: 'Pantry', price: 650, unit: '1 liter', stock: 22, image: photo('photo-1474979266404-7eaacbcd87c5') },
      { name: 'Basmati Rice 5kg', category: 'Pantry', price: 1850, unit: '5kg', stock: 18, image: photo('photo-1536304993881-ff6e9eefa2a6') },
      { name: 'Tea Pack', category: 'Pantry', price: 550, unit: '450g', stock: 27, image: photo('photo-1544787219-7f47ccb76574') },
      { name: 'Dishwash Liquid', category: 'Household', price: 390, unit: '500ml', stock: 20, image: photo('photo-1583947215259-38e31be8751f') },
      { name: 'Tissue Roll Pack', category: 'Household', price: 480, unit: '6 rolls', stock: 32, image: photo('photo-1584556812952-905ffd0c611a') },
      { name: 'Chocolate Cookies', category: 'Snacks', price: 260, unit: 'pack', stock: 50, image: photo('photo-1558961363-fa8fdf82db35') }
    ]);

    console.log('Seed completed: users, restaurants, menu items and groceries added. No demo orders or reservations were created.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
