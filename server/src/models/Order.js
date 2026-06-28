import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema(
  {
    status: String,
    note: String,
    updatedBy: String,
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    itemType: { type: String, enum: ['food', 'grocery'], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    sourceName: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
    fulfillmentType: { type: String, enum: ['Delivery', 'Dine-In'], default: 'Delivery' },
    prepTime: { type: Number, default: 15 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fulfillmentType: { type: String, enum: ['Delivery', 'Dine-In'], default: 'Delivery' },
    orderSource: { type: String, enum: ['Restaurant', 'Grocery', 'Mixed'], default: 'Mixed' },
    items: [orderItemSchema],
    deliveryAddress: { type: String, default: '' },
    dineInGuests: { type: Number, default: 0 },
    dineInTime: { type: String, default: '' },
    customerPhone: { type: String, required: true },
    notes: { type: String, default: '' },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    status: {
      type: String,
      enum: [
        'Pending',
        'Accepted',
        'Preparing',
        'Packing',
        'Ready for Dine-In',
        'Assigned to Rider',
        'Picked Up',
        'On the Way',
        'Delivered',
        'Served',
        'Cancelled'
      ],
      default: 'Pending'
    },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    riderName: { type: String, default: '' },
    riderPhone: { type: String, default: '' },
    estimatedMinutes: { type: Number, default: 35 },
    deliveryFee: { type: Number, default: 150 },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    timeline: [timelineSchema]
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
