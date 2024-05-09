import mongoose from 'mongoose';
import Product from '../models/Product';

interface Product {
  name: string;
  desc: string;
  type: string;
  unit: string;
  price: number;
  available: boolean;
  suplier: string;
  banner: string;
}

// Dealing with database operations
export class ProductRepository {
  async CreateProduct({ name, desc, type, unit, price, available, suplier, banner }: Product): Promise<any> {
    const product = new Product({
      name,
      desc,
      type,
      unit,
      price,
      available,
      suplier,
      banner,
    });

    const productResult = await product.save();
    return productResult;
  }

  async Products(): Promise<any[]> {
    return await Product.find();
  }

  async FindById(id: string): Promise<any | null> {
    return await Product.findById(id);
  }

  async FindByCategory(category: string): Promise<any[]> {
    const products = await Product.find({ type: category });
    return products;
  }

  async FindSelectedProducts(selectedIds: string[]): Promise<any[]> {
    const products = await Product.find()
      .where('_id')
      .in(selectedIds.map((_id) => _id))
      .exec();
    return products;
  }
}
