import { ShoppingRepository } from '../database';
import { FormateData, RPCRequest } from '../utils';

interface Product {
  _id: string;
}

interface WishlistItem {
  _id: string;
}

interface Wishlist {
  products: WishlistItem[];
}

interface Order {
  // Define your Order interface here
}

interface PayloadData {
  event: string;
  data: {
    userId: string;
    product?: Product;
    qty?: number;
    orderId?: string;
    txnNumber?: string;
  };
}

class ShoppingService {
  private repository: any;

  constructor() {
    this.repository = new ShoppingRepository();
  }

  async AddCartItem(customerId: string, product_id: string, qty: number): Promise<any> {
    const productResponse: any = await RPCRequest('PRODUCT_RPC', {
      type: 'VIEW_PRODUCT',
      data: product_id,
    });

    if (productResponse && productResponse._id) {
      const data = await this.repository.ManageCart(customerId, productResponse, qty);
      return data;
    }

    throw new Error('Product data not found!');
  }

  async RemoveCartItem(customerId: string, product_id: string): Promise<any> {
    return await this.repository.ManageCart(customerId, { _id: product_id }, 0, true);
  }

  async GetCart(_id: string): Promise<any> {
    return this.repository.Cart(_id);
  }

  async AddToWishlist(customerId: string, product_id: string): Promise<any> {
    return this.repository.ManageWishlist(customerId, product_id);
  }

  async RemoveFromWishlist(customerId: string, product_id: string): Promise<any> {
    return this.repository.ManageWishlist(customerId, product_id, true);
  }

  async GetWishlist(customerId: string): Promise<any> {
    const wishlist = await this.repository.GetWishlistByCustomerId(customerId);

    if (!wishlist) {
      return {};
    }

    const { products } = wishlist;

    if (Array.isArray(products)) {
      const ids = products.map(({ _id }) => _id);
      const productResponse = await RPCRequest('PRODUCT_RPC', {
        type: 'VIEW_PRODUCTS',
        data: ids,
      });

      if (productResponse) {
        return productResponse;
      }
    }

    return {};
  }

  async CreateOrder(customerId: string, txnNumber: string): Promise<any> {
    return this.repository.CreateNewOrder(customerId, txnNumber);
  }

  async GetOrder(orderId: string): Promise<any> {
    return this.repository.Orders('', orderId);
  }

  async GetOrders(customerId: string): Promise<any> {
    return this.repository.Orders(customerId);
  }

  async ManageCart(customerId: string, item: Product, qty: number, isRemove?: boolean): Promise<any> {
    const cartResult = await this.repository.AddCartItem(customerId, item, qty, isRemove);
    return FormateData(cartResult);
  }

  async SubscribeEvents(payload: string): Promise<void> {
    const parsedPayload: PayloadData = JSON.parse(payload);
    const { event, data } = parsedPayload;
    const { userId, product, qty } = data;

    switch (event) {
      case 'ADD_TO_CART':
        await this.ManageCart(userId, product!, qty!, false);
        break;
      case 'REMOVE_FROM_CART':
        await this.ManageCart(userId, product!, qty!, true);
        break;
      default:
        break;
    }
  }

  async deleteProfileData(customerId: string): Promise<any> {
    return this.repository.deleteProfileData(customerId);
  }

  async HandleDeleteProfileEvent(payload: string): Promise<void> {
    const parsedPayload: PayloadData = JSON.parse(payload);
    const { event, data } = parsedPayload;

    switch (event) {
      case 'DELETE_PROFILE':
        await this.deleteProfileData(data.userId);
        break;
      default:
        break;
    }
  }
}

export default ShoppingService;
