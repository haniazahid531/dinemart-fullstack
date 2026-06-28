import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import GroceryItem from '../models/GroceryItem.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const generateOrderNumber = () => `DM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

const statusNotes = {
  Pending: 'Order received and waiting for admin approval.',
  Accepted: 'Order accepted by admin.',
  Preparing: 'Restaurant is preparing your food.',
  Packing: 'Grocery items are being packed.',
  'Ready for Dine-In': 'Your dine-in order is ready at the restaurant.',
  'Assigned to Rider': 'A rider has been assigned to this delivery order.',
  'Picked Up': 'Rider picked up the order.',
  'On the Way': 'Rider is on the way to deliver your order.',
  Delivered: 'Order delivered successfully.',
  Served: 'Dine-in order has been served/completed.',
  Cancelled: 'Order has been cancelled.'
};

const getOrderSource = (items) => {
  const hasFood = items.some((item) => item.itemType === 'food');
  const hasGrocery = items.some((item) => item.itemType === 'grocery');
  if (hasFood && hasGrocery) return 'Mixed';
  if (hasFood) return 'Restaurant';
  return 'Grocery';
};

router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { items, deliveryAddress, customerPhone, notes, fulfillmentType, dineInGuests, dineInTime } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const normalizedFulfillment = fulfillmentType === 'Dine-In' ? 'Dine-In' : 'Delivery';
    const hasGrocery = items.some((item) => item.itemType === 'grocery');
    const hasFood = items.some((item) => item.itemType === 'food');

    if (!customerPhone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    if (normalizedFulfillment === 'Dine-In') {
      if (hasGrocery) {
        return res.status(400).json({ message: 'Groceries are delivery only. Please checkout dine-in food separately.' });
      }
      if (!hasFood) {
        return res.status(400).json({ message: 'Dine-in order must contain restaurant food items.' });
      }
      if (!dineInGuests || !dineInTime) {
        return res.status(400).json({ message: 'Guests and dine-in time are required for dine-in orders.' });
      }
    }

    if (normalizedFulfillment === 'Delivery' && !deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required for delivery orders' });
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const orderSource = getOrderSource(items);
    const deliveryFee = normalizedFulfillment === 'Dine-In' ? 0 : hasFood && hasGrocery ? 220 : 150;
    const estimatedMinutes = normalizedFulfillment === 'Dine-In'
      ? Math.max(15, ...items.map((item) => Number(item.prepTime || 15))) + 10
      : hasFood && hasGrocery ? 55 : hasFood ? 40 : 30;

    const timelineNote = normalizedFulfillment === 'Dine-In'
      ? `Dine-in request received. Estimated waiting time is ${estimatedMinutes} minutes.`
      : statusNotes.Pending;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: req.user._id,
      fulfillmentType: normalizedFulfillment,
      orderSource,
      items: items.map((item) => ({ ...item, fulfillmentType: normalizedFulfillment })),
      deliveryAddress: normalizedFulfillment === 'Delivery' ? deliveryAddress : '',
      dineInGuests: normalizedFulfillment === 'Dine-In' ? Number(dineInGuests) : 0,
      dineInTime: normalizedFulfillment === 'Dine-In' ? dineInTime : '',
      customerPhone,
      notes: notes || '',
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      estimatedMinutes,
      timeline: [{ status: 'Pending', note: timelineNote, updatedBy: req.user.name }]
    });

    // Reduce grocery stock for grocery delivery items.
    for (const item of items) {
      if (item.itemType === 'grocery' && item.itemId) {
        await GroceryItem.findByIdAndUpdate(item.itemId, { $inc: { stock: -Number(item.quantity) } });
      }
    }

    const populated = await Order.findById(order._id).populate('customer', 'name email phone');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', protect, authorize('customer'), async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('rider', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, authorize('admin', 'rider'), async (req, res) => {
  try {
    const query = req.user.role === 'rider' ? { rider: req.user._id, fulfillmentType: 'Delivery' } : {};
    const orders = await Order.find(query)
      .populate('customer', 'name email phone address')
      .populate('rider', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', protect, authorize('admin', 'rider'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Accepted', 'Preparing', 'Packing', 'Ready for Dine-In', 'Assigned to Rider', 'Picked Up', 'On the Way', 'Delivered', 'Served', 'Cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'rider') {
      if (order.fulfillmentType !== 'Delivery') {
        return res.status(403).json({ message: 'Riders can only update delivery orders' });
      }
      if (String(order.rider) !== String(req.user._id)) {
        return res.status(403).json({ message: 'This order is not assigned to you' });
      }
      if (!['Picked Up', 'On the Way', 'Delivered'].includes(status)) {
        return res.status(403).json({ message: 'Rider can only update delivery progress statuses' });
      }
    }

    if (order.fulfillmentType === 'Dine-In' && ['Assigned to Rider', 'Picked Up', 'On the Way', 'Delivered', 'Packing'].includes(status)) {
      return res.status(400).json({ message: 'This status is only for delivery/grocery orders' });
    }

    order.status = status;
    order.timeline.push({
      status,
      note: statusNotes[status] || `Status updated to ${status}`,
      updatedBy: req.user.name
    });
    await order.save();

    const updated = await Order.findById(order._id)
      .populate('customer', 'name email phone address')
      .populate('rider', 'name email phone');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/assign-rider', protect, authorize('admin'), async (req, res) => {
  try {
    const { riderId } = req.body;
    const rider = await User.findOne({ _id: riderId, role: 'rider' });
    if (!rider) return res.status(404).json({ message: 'Rider not found' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.fulfillmentType !== 'Delivery') {
      return res.status(400).json({ message: 'Rider can only be assigned to delivery orders' });
    }

    order.rider = rider._id;
    order.riderName = rider.name;
    order.riderPhone = rider.phone;
    order.status = 'Assigned to Rider';
    order.timeline.push({
      status: 'Assigned to Rider',
      note: `${rider.name} has been assigned. Contact: ${rider.phone}`,
      updatedBy: req.user.name
    });

    await order.save();
    const updated = await Order.findById(order._id)
      .populate('customer', 'name email phone address')
      .populate('rider', 'name email phone');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
