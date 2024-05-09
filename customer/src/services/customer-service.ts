import { CustomerRepository } from '../database';
import { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from '../utils';

interface UserInputs {
  email: string;
  password: string;
  phone?: string;
}

interface AddressInputs {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

interface CustomerProfile {
  _id: string;
  email: string;
  password: string;
  salt: string;
}

interface CustomerServiceResponse {
  id: string;
  token: string;
}

interface DeleteProfileResponse {
  data: any; // Define the type of data returned by DeleteCustomerById
  payload: {
    event: string;
    data: {
      userId: string;
    };
  };
}

// All Business logic will be here
class CustomerService {
  private repository: any;

  constructor() {
    this.repository = new CustomerRepository();
  }

  async SignIn(userInputs: UserInputs): Promise<CustomerServiceResponse> {
    const { email, password } = userInputs;

    const existingCustomer = await this.repository.FindCustomer({ email });

    if (!existingCustomer) throw new Error('user not found with provided email id!');

    const validPassword = await ValidatePassword(password, existingCustomer.password, existingCustomer.salt);
    if (!validPassword) throw new Error('password does not match!');

    const token = await GenerateSignature({
      email: existingCustomer.email,
      _id: existingCustomer._id,
    });

    return { id: existingCustomer._id, token };
  }

  async SignUp(userInputs: UserInputs): Promise<CustomerServiceResponse> {
    const { email, password, phone } = userInputs;

    // create salt
    let salt = await GenerateSalt();

    let userPassword = await GeneratePassword(password, salt);

    const existingCustomer = await this.repository.CreateCustomer({
      email,
      password: userPassword,
      phone,
      salt,
    });

    const token = await GenerateSignature({
      email: email,
      _id: existingCustomer._id,
    });
    return { id: existingCustomer._id, token };
  }

  async AddNewAddress(_id: string, addressInputs: AddressInputs): Promise<any> {
    const { street, postalCode, city, country } = addressInputs;

    return this.repository.CreateAddress({
      _id,
      street,
      postalCode,
      city,
      country,
    });
  }

  async GetProfile(id: string): Promise<CustomerProfile> {
    return this.repository.FindCustomerById({ id });
  }

  async DeleteProfile(userId: string): Promise<DeleteProfileResponse> {
    const data = await this.repository.DeleteCustomerById(userId);
    const payload = {
      event: 'DELETE_PROFILE',
      data: { userId },
    };
    return { data, payload };
  }
}

export default CustomerService;
