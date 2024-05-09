import mongoose from 'mongoose';
import { OrderModel, CartModel, WishlistModel } from '../models';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

interface CartItem {
  product: any;
  unit: number;
}

interface WishlistItem {
  _id: string;
}

// Dealing with database operations
class ShoppingRepository {
  // Cart
  async Cart(customerId: string) {
    return CartModel.findOne({ customerId });
  }

  async ManageCart(customerId: string, product: any, qty: number, isRemove: boolean) {
    const cart = await CartModel.findOne({ customerId });
    if (cart) {
      if (isRemove) {
        const cartItems = _.filter(cart.items, (item: CartItem) => item.product._id !== product._id);
        cart.items = cartItems;
        // handle remove case
      } else {
        const cartIndex = _.findIndex(cart.items, {
          product: { _id: product._id },
        });
        if (cartIndex > -1) {
          cart.items[cartIndex].unit = qty;
        } else {
          cart.items.push({ product: { ...product }, unit: qty });
        }
      }
      return await cart.save();
    } else {
      // create a new one
      return await CartModel.create({
        customerId,
        items: [{ product: { ...product }, unit: qty }],
      });
    }
  }

  async ManageWishlist(customerId: string, product_id: string, isRemove: boolean = false) {
    const wishlist = await WishlistModel.findOne({ customerId });
    if (wishlist) {
      if (isRemove) {
        const products = _.filter(wishlist.products, (product: WishlistItem) => product._id !== product_id);
        wishlist.products = products;
        // handle remove case
      } else {
        const wishlistIndex = _.findIndex(wishlist.products, {
          _id: product_id,
        });
        if (wishlistIndex < 0) {
          wishlist.products.push({ _id: product_id });
        }
      }
      return await wishlist.save();
    } else {
      // create a new one
      return await WishlistModel.create({
        customerId,
        wishlist: [{ _id: product_id }],
      });
    }
  }

  async GetWishlistByCustomerId(customerId: string) {
    return WishlistModel.findOne({ customerId });
  }

  async Orders(customerId: string, orderId?: string) {
    if (orderId) {
      return OrderModel.findOne({ _id: orderId });
    } else {
      return OrderModel.find({ customerId });
    }
  }

  async CreateNewOrder(customerId: string, txnId: string) {
    const cart = await CartModel.findOne({ customerId });

    if (cart) {
      let amount = 0;

      let cartItems = cart.items;

      if (cartItems.length > 0) {
        // process Order

        cartItems.map((item: any) => {
          amount += parseInt(item.product.price) * parseInt(item.unit);
        });

        const orderId = uuidv4();

        const order = new OrderModel({
          orderId,
          customerId,
          amount,
          status: 'received',
          items: cartItems,
        });

        cart.items = [];

        const orderResult = await order.save();
        await cart.save();
        return orderResult;
      }
    }

    return {};
  }

  async deleteProfileData(customerId: string) {
    return Promise.all([CartModel.findOneAndDelete({ customerId }), WishlistModel.findOneAndDelete({ customerId })]);
  }
}

export { ShoppingRepository };
