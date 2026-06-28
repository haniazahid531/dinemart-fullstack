import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cuisine: { type: String, required: true },
    image: { type: String, default: '' },
    rating: { type: Number, default: 4.5 },
    deliveryTime: { type: Number, default: 35 },
    deliveryFee: { type: Number, default: 150 },
    address: { type: String, default: '' },
    isOpen: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
