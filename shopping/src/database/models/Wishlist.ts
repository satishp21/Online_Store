import mongoose, { Schema, Document } from 'mongoose';

interface Product {
  _id: string;
}

interface Wishlist extends Document {
  customerId: string;
  products: Product[];
}

const WishlistSchema: Schema = new Schema({
  customerId: { type: String, required: true },
  products: [
    {
      _id: { type: String, required: true },
    },
  ],
});

const WishlistModel = mongoose.model<Wishlist>('Wishlist', WishlistSchema);

export default WishlistModel;
