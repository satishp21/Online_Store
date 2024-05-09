import mongoose, { Schema, Document } from 'mongoose';

interface IAddress {
  _id: Schema.Types.ObjectId;
  // Add other properties of the Address schema if needed
}

interface ICustomer extends Document {
  email: string;
  password: string;
  salt: string;
  phone: string;
  address: IAddress[];
}

const CustomerSchema: Schema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    phone: { type: String },
    address: [{ type: Schema.Types.ObjectId, ref: 'address', required: true }],
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
      },
    },
    timestamps: true,
  },
);

const CustomerModel = mongoose.model<ICustomer>('customer', CustomerSchema);

export default CustomerModel;
