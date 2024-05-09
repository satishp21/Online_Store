import mongoose, { Schema, Document } from 'mongoose';

interface Product {
  _id: string;
  name: string;
  desc: string;
  banner: string;
  type: string;
  unit: number;
  price: number;
  supplier: string;
}

interface OrderItem {
  product: Product;
  unit: number;
}

interface Order extends Document {
  orderId: string;
  customerId: string;
  amount: number;
  status: string;
  items: OrderItem[];
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String },
    customerId: { type: String },
    amount: { type: Number },
    status: { type: String },
    items: [
      {
        product: {
          _id: { type: String, required: true },
          name: { type: String },
          desc: { type: String },
          banner: { type: String },
          type: { type: String },
          unit: { type: Number },
          price: { type: Number },
          supplier: { type: String },
        },
        unit: { type: Number, required: true },
      },
    ],
  },
  {
    toJSON: {
      transform(doc: any, ret: any) {
        delete ret.__v;
      },
    },
    timestamps: true,
  },
);

const OrderModel = mongoose.model < Order > ('Order', OrderSchema);

export default OrderModel;
