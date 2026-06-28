import express from 'express';
import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import GroceryItem from '../models/GroceryItem.js';

const router = express.Router();

router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ rating: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/restaurants/:id/menu', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const items = await MenuItem.find({ restaurant: req.params.id, isAvailable: true }).sort({ category: 1, name: 1 });
    res.json({ restaurant, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/groceries', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { isAvailable: true };

    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const items = await GroceryItem.find(query).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/grocery-categories', async (req, res) => {
  try {
    const categories = await GroceryItem.distinct('category');
    res.json(['All', ...categories]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
