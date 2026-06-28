import mongoose from 'mongoose';

const preorderItemSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId },
    name: String,
    quantity: Number,
    price: Number,
    image: { type: String, default: '' }
  },
  { _id: false }
);

const reservationSchema = new mongoose.Schema(
  {
    reservationNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    guests: { type: Number, required: true, min: 1 },
    date: { type: String, required: true },
    time: { type: String, required: true },
    phone: { type: String, required: true },
    specialRequest: { type: String, default: '' },
    preorderItems: [preorderItemSchema],
    preorderTotal: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled'], default: 'Pending' }
  },
  { timestamps: true }
);

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
