import { SignupsRepository } from "./signups.repository";
import { ProductsRepository } from "../products/products.repository";
import { NotFoundException } from "../common/filters/http-exception.filter";
import { scheduleSignupNotification } from "./signups.queue";
import { createSignupSchema, SignupResponseDto } from "./dto/create-signup.dto";

export class SignupsService {
  constructor(
    private readonly repository: SignupsRepository,
    private readonly productsRepository: ProductsRepository
  ) {}

  async createSignup(productId: string, rawInput: unknown): Promise<SignupResponseDto> {
    // 1. Validate the email shape before touching the database at all.
    const { email } = createSignupSchema.parse(rawInput);

    // 2. Make sure the product actually exists — avoids a confusing FK error later.
    const productExists = await this.productsRepository.exists(productId);
    if (!productExists) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    // 3. Persist the signup (repository turns a duplicate into ConflictException).
    const signup = await this.repository.create(productId, email);

    // 4. Schedule the async notification job — never send the email directly here.
    await scheduleSignupNotification({
      signupId: signup.id,
      email: signup.email,
      productId: signup.productId,
    });

    return {
      id: signup.id,
      productId: signup.productId,
      email: signup.email,
      status: signup.status,
      createdAt: signup.createdAt.toISOString(),
    };
  }
}
