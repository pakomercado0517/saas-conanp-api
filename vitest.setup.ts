import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock: Sequelize / Base de datos
// ---------------------------------------------------------------------------

const mockTransaction = {
  commit: vi.fn().mockResolvedValue(undefined),
  rollback: vi.fn().mockResolvedValue(undefined),
};

const createMockModel = (): unknown => ({
  findOne: vi.fn().mockResolvedValue(null),
  findAll: vi.fn().mockResolvedValue([]),
  findByPk: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockImplementation((data: unknown) => Promise.resolve({ ...data, id: 1 })),
  update: vi.fn().mockResolvedValue([1]),
  destroy: vi.fn().mockResolvedValue(1),
  count: vi.fn().mockResolvedValue(0),
  findAndCountAll: vi.fn().mockResolvedValue({ rows: [], count: 0 }),
  belongsTo: vi.fn().mockReturnThis(),
  hasMany: vi.fn().mockReturnThis(),
  hasOne: vi.fn().mockReturnThis(),
  belongsToMany: vi.fn().mockReturnThis(),
});

const mockDefine = vi.fn().mockImplementation(() => createMockModel());

export const mockSequelize = {
  authenticate: vi.fn().mockResolvedValue(undefined),
  query: vi.fn().mockResolvedValue([]),
  transaction: vi
    .fn()
    .mockImplementation((fn: (t: typeof mockTransaction) => Promise<unknown>) =>
      fn(mockTransaction)
    ),
  define: mockDefine,
  models: {} as Record<string, ReturnType<typeof createMockModel>>,
  close: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/shared/database', () => ({
  sequelize: mockSequelize,
  testConnection: vi.fn().mockResolvedValue(undefined),
  default: mockSequelize,
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
