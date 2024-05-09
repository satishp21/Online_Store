import mongoose, { Schema, Document } from 'mongoose';

interface IProduct extends Document {
  name: string;
  desc: string;
  banner: string;
  type: string;
  unit: number;
  price: number;
  available: boolean;
  supplier: string;
}

const ProductSchema: Schema = new Schema({
  name: String,
  desc: String,
  banner: String,
  type: String,
  unit: Number,
  price: Number,
  available: Boolean,
  supplier: String,
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
