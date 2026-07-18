import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignupsService } from "./signups.service";
import { SignupsRepository } from "./signups.repository";
import { ProductsRepository } from "../products/products.repository";
import { ConflictException, NotFoundException } from "../common/filters/http-exception.filter";

// Mock the whole queue module — scheduleSignupNotification isn't injected via
// constructor, so this is the only way to control/spy on it in these tests.
vi.mock("./signups.queue", () => ({
  scheduleSignupNotification: vi.fn().mockResolvedValue(undefined),
}));

import { scheduleSignupNotification } from "./signups.queue";

const FAKE_PRODUCT_ID = "11111111-1111-1111-1111-111111111111";

function makeFakeSignup(overrides = {}) {
  return {
    id: "22222222-2222-2222-2222-222222222222",
    productId: FAKE_PRODUCT_ID,
    email: "test@mail.com",
    status: "pending" as const,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("SignupsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid email before touching any repository", async () => {
    const fakeSignupsRepo = {
      create: vi.fn(),
      updateStatus: vi.fn(),
    } as unknown as SignupsRepository;

    const fakeProductsRepo = {
      exists: vi.fn(),
    } as unknown as ProductsRepository;

    const service = new SignupsService(fakeSignupsRepo, fakeProductsRepo);

    await expect(
      service.createSignup(FAKE_PRODUCT_ID, { email: "not-an-email" })
    ).rejects.toThrow();

    // Nothing else should have run — invalid input is rejected first.
    expect(fakeProductsRepo.exists).not.toHaveBeenCalled();
    expect(fakeSignupsRepo.create).not.toHaveBeenCalled();
    expect(scheduleSignupNotification).not.toHaveBeenCalled();
  });

  it("throws NotFoundException when the product does not exist", async () => {
    const fakeSignupsRepo = {
      create: vi.fn(),
      updateStatus: vi.fn(),
    } as unknown as SignupsRepository;

    const fakeProductsRepo = {
      exists: vi.fn().mockResolvedValue(false),
    } as unknown as ProductsRepository;

    const service = new SignupsService(fakeSignupsRepo, fakeProductsRepo);

    await expect(
      service.createSignup(FAKE_PRODUCT_ID, { email: "test@mail.com" })
    ).rejects.toThrow(NotFoundException);

    expect(fakeSignupsRepo.create).not.toHaveBeenCalled();
    expect(scheduleSignupNotification).not.toHaveBeenCalled();
  });

  it("propagates ConflictException when the repository detects a duplicate", async () => {
    const fakeSignupsRepo = {
      create: vi.fn().mockRejectedValue(new ConflictException("Already registered")),
      updateStatus: vi.fn(),
    } as unknown as SignupsRepository;

    const fakeProductsRepo = {
      exists: vi.fn().mockResolvedValue(true),
    } as unknown as ProductsRepository;

    const service = new SignupsService(fakeSignupsRepo, fakeProductsRepo);

    await expect(
      service.createSignup(FAKE_PRODUCT_ID, { email: "test@mail.com" })
    ).rejects.toThrow(ConflictException);

    // The service doesn't need to schedule a job for a signup that was never created.
    expect(scheduleSignupNotification).not.toHaveBeenCalled();
  });

  it("happy path: creates the signup and schedules the notification job", async () => {
    const fakeSignup = makeFakeSignup();

    const fakeSignupsRepo = {
      create: vi.fn().mockResolvedValue(fakeSignup),
      updateStatus: vi.fn(),
    } as unknown as SignupsRepository;

    const fakeProductsRepo = {
      exists: vi.fn().mockResolvedValue(true),
    } as unknown as ProductsRepository;

    const service = new SignupsService(fakeSignupsRepo, fakeProductsRepo);

    const result = await service.createSignup(FAKE_PRODUCT_ID, { email: "test@mail.com" });

    expect(fakeSignupsRepo.create).toHaveBeenCalledWith(FAKE_PRODUCT_ID, "test@mail.com");
    expect(scheduleSignupNotification).toHaveBeenCalledWith({
      signupId: fakeSignup.id,
      email: fakeSignup.email,
      productId: fakeSignup.productId,
    });
    expect(result).toEqual({
      id: fakeSignup.id,
      productId: fakeSignup.productId,
      email: fakeSignup.email,
      status: "pending",
      createdAt: fakeSignup.createdAt.toISOString(),
    });
  });
});
