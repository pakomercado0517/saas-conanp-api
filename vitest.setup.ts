import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock: Sequelize (ver vitest-sequelize-mock.ts)
// ---------------------------------------------------------------------------

vi.mock('@/shared/database/index.js', async () => {
  const { mockSequelize } = await import('./vitest-sequelize-mock.js');
  return {
    sequelize: mockSequelize,
    testConnection: vi.fn().mockResolvedValue(undefined),
    default: mockSequelize,
  };
});

export { mockSequelize } from './vitest-sequelize-mock.js';

// Evita cargar asociaciones Sequelize (User/Dependencia) en tests que mockean modelos.
vi.mock('@/modules/dependencias/models/dependencia-membership.model.js', () => ({
  DependenciaMembership: {
    create: vi.fn().mockResolvedValue({ id: 'mock-dep-membership-id' }),
    findOne: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
  },
}));

// ---------------------------------------------------------------------------
// Mock: Stripe
// ---------------------------------------------------------------------------

const createStripeMethod = (defaultId: string): unknown =>
  vi.fn().mockResolvedValue({ id: defaultId });

export const mockStripeClient = {
  customers: {
    create: createStripeMethod('cus_mock'),
    retrieve: createStripeMethod('cus_mock'),
    update: createStripeMethod('cus_mock'),
    list: vi.fn().mockResolvedValue({ data: [] }),
  },
  paymentIntents: {
    create: createStripeMethod('pi_mock'),
    retrieve: createStripeMethod('pi_mock'),
    confirm: createStripeMethod('pi_mock'),
    list: vi.fn().mockResolvedValue({ data: [] }),
  },
  checkout: {
    sessions: {
      create: createStripeMethod('cs_mock'),
      retrieve: createStripeMethod('cs_mock'),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
  },
  subscriptions: {
    create: createStripeMethod('sub_mock'),
    retrieve: createStripeMethod('sub_mock'),
    update: createStripeMethod('sub_mock'),
    cancel: createStripeMethod('sub_mock'),
    list: vi.fn().mockResolvedValue({ data: [] }),
  },
  balance: {
    retrieve: vi.fn().mockResolvedValue({ available: [], pending: [] }),
  },
  webhooks: {
    constructEvent: vi.fn().mockReturnValue({ id: 'evt_mock', type: 'payment_intent.succeeded' }),
  },
};

vi.mock('@/shared/stripe', () => ({
  stripeClient: mockStripeClient,
  stripeConfig: {
    currency: 'mxn',
    region: 'mx',
    secretKey: 'sk_test_mock',
    webhookSecret: 'whsec_mock',
  } as const,
  handleStripeError: vi.fn().mockImplementation((err: unknown) => {
    throw err;
  }),
  testStripeConnection: vi.fn().mockResolvedValue(undefined),
  getDefaultCurrency: vi.fn().mockReturnValue('mxn'),
  getDefaultRegion: vi.fn().mockReturnValue('mx'),
}));

// ---------------------------------------------------------------------------
// Mock: Storage (S3 / R2)
// ---------------------------------------------------------------------------

export const mockUploadFile = vi.fn().mockResolvedValue({
  key: 'mock/key.pdf',
  size: 0,
  publicUrl: 'https://mock.example.com/mock/key.pdf',
});

export const mockDeleteFile = vi.fn().mockResolvedValue(undefined);

export const mockGetSignedUrl = vi
  .fn()
  .mockResolvedValue('https://mock-signed-url.example.com/key');

export const mockGetPublicUrl = vi
  .fn()
  .mockImplementation((key: string) => `https://mock.example.com/${key}`);

export const mockGenerateFileKey = vi.fn().mockReturnValue('evidencias/2025-02-01/mock-uuid.pdf');

vi.mock('@/shared/storage', () => ({
  uploadFile: mockUploadFile,
  deleteFile: mockDeleteFile,
  getSignedUrl: mockGetSignedUrl,
  getPublicUrl: mockGetPublicUrl,
  generateFileKey: mockGenerateFileKey,
  storageConfig: {
    bucketName: 'test-bucket',
    publicUrl: 'https://mock.example.com',
  } as const,
  s3Client: {},
}));
