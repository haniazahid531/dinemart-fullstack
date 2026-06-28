import mongoose from 'mongoose';

const groceryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, default: 'piece' },
    stock: { type: Number, default: 25 },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const GroceryItem = mongoose.model('GroceryItem', groceryItemSchema);
export default GroceryItem;
