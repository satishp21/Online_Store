import mongoose, { Schema, Document } from 'mongoose';

interface Product {
  _id: string;
  name: string;
  img: string;
  unit: number;
  price: number;
}

interface CartItem {
  product: Product;
  unit: number;
}

interface Cart extends Document {
  customerId: string;
  items: CartItem[];
}

const CartSchema: Schema = new Schema({
  customerId: { type: String },
  items: [
    {
      product: {
        _id: { type: String, required: true },
        name: { type: String },
        img: { type: String },
        unit: { type: Number },
        price: { type: Number },
      },
      unit: { type: Number, required: true },
    },
  ],
});

const CartModel = mongoose.model < Cart > ('cart', CartSchema);

export default CartModel;
