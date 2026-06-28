import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import Restaurant from '../models/Restaurant.js';
import GroceryItem from '../models/GroceryItem.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [customers, riders, orders, reservations, restaurants, groceries] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'rider' }),
      Order.countDocuments(),
      Reservation.countDocuments(),
      Restaurant.countDocuments(),
      GroceryItem.countDocuments()
    ]);

    const sales = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$total' } } }
    ]);

    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const activeDeliveries = await Order.countDocuments({ status: { $in: ['Assigned to Rider', 'Picked Up', 'On the Way'] } });

    res.json({
      customers,
      riders,
      orders,
      reservations,
      restaurants,
      groceries,
      pendingOrders,
      activeDeliveries,
      totalSales: sales[0]?.totalSales || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/riders', protect, authorize('admin'), async (req, res) => {
  try {
    const riders = await User.find({ role: 'rider' }).select('-password').sort({ name: 1 });
    res.json(riders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
