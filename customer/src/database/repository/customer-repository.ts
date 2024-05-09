// import CustomerModel, AddressModel from '../models';

import CustomerModel from '../models/Customer';
import AddressModel from '../models/Address';

interface CreateCustomerParams {
  email: string;
  password: string;
  phone: string;
  salt: string;
}

interface CreateAddressParams {
  _id: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

interface FindCustomerParams {
  email: string;
}

interface FindCustomerByIdParams {
  id: string;
}

class CustomerRepository {
  async CreateCustomer({ email, password, phone, salt }: CreateCustomerParams): Promise<any> {
    const customer = new CustomerModel({
      email,
      password,
      salt,
      phone,
      address: [],
    });

    const customerResult = await customer.save();
    return customerResult;
  }

  async CreateAddress({ _id, street, postalCode, city, country }: CreateAddressParams): Promise<any> {
    const profile = await CustomerModel.findById(_id);

    if (profile) {
      const newAddress = new AddressModel({
        street,
        postalCode,
        city,
        country,
      });

      await newAddress.save();

      profile.address.push(newAddress);
    }

    return await profile!.save();
  }

  async FindCustomer({ email }: FindCustomerParams): Promise<any> {
    const existingCustomer = await CustomerModel.findOne({ email });
    return existingCustomer;
  }

  async FindCustomerById({ id }: FindCustomerByIdParams): Promise<any> {
    const existingCustomer = await CustomerModel.findById(id).populate('address');
    return existingCustomer;
  }

  async DeleteCustomerById(id: string): Promise<any> {
    return CustomerModel.findByIdAndDelete(id);
  }
}

export { CustomerRepository };
