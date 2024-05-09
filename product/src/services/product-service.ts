import { ProductRepository } from '../database/repository/product-repository';
import { FormateData } from '../utils';

// Define types if necessary

interface Product {
  // Define the structure of a product if needed
}

interface ProductInput {
  // Define the structure of productInputs if needed
}

interface Payload {
  event: string;
  data: {
    userId: string;
    product: Product;
    qty: number;
  };
}

// All Business logic will be here
class ProductService {
  repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  async CreateProduct(productInputs: any): Promise<any> {
    const productResult = await this.repository.CreateProduct(productInputs);
    return FormateData(productResult);
  }

  async GetProducts(): Promise<any> {
    const products = await this.repository.Products();

    let categories: { [key: string]: string } = {};

    products.map(({ type }) => {
      categories[type] = type;
    });

    return FormateData({
      products,
      categories: Object.keys(categories),
    });
  }

  async GetProductDescription(productId: string): Promise<any> {
    const product = await this.repository.FindById(productId);
    return FormateData(product);
  }

  async GetProductsByCategory(category: string): Promise<any> {
    const products = await this.repository.FindByCategory(category);
    return FormateData(products);
  }

  async GetSelectedProducts(selectedIds: string[]): Promise<any> {
    const products = await this.repository.FindSelectedProducts(selectedIds);
    return FormateData(products);
  }

  async GetProductPayload(
    userId: string,
    { productId, qty }: { productId: string; qty: number },
    event: string,
  ): Promise<any> {
    const product = await this.repository.FindById(productId);

    if (product) {
      const payload: Payload = {
        event: event,
        data: { userId, product, qty },
      };

      return FormateData(payload);
    } else {
      return FormateData({ error: 'No product Available' });
    }
  }

  // RPC Response
  async serveRPCRequest(payload: any): Promise<any> {
    const { type, data } = payload;
    switch (type) {
      case 'VIEW_PRODUCT':
        return this.repository.FindById(data);
      case 'VIEW_PRODUCTS':
        return this.repository.FindSelectedProducts(data);
      default:
        break;
    }
  }
}

export default ProductService;
