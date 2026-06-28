import express from 'express';
import Reservation from '../models/Reservation.js';
import Restaurant from '../models/Restaurant.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const generateReservationNumber = () => `RSV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { restaurant, guests, date, time, phone, specialRequest, preorderItems } = req.body;

    if (!restaurant || !guests || !date || !time || !phone) {
      return res.status(400).json({ message: 'Restaurant, guests, date, time and phone are required' });
    }

    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) return res.status(404).json({ message: 'Restaurant not found' });

    const preorderTotal = (preorderItems || []).reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

    const reservation = await Reservation.create({
      reservationNumber: generateReservationNumber(),
      customer: req.user._id,
      restaurant,
      guests,
      date,
      time,
      phone,
      specialRequest: specialRequest || '',
      preorderItems: preorderItems || [],
      preorderTotal
    });

    const populated = await Reservation.findById(reservation._id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name cuisine address');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', protect, authorize('customer'), async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer: req.user._id })
      .populate('restaurant', 'name cuisine address image')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name cuisine address')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name cuisine address');

    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
