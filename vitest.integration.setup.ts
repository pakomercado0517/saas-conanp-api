import dotenv from 'dotenv';
import { vi } from 'vitest';

dotenv.config();

// ---------------------------------------------------------------------------
// Mock: Stripe (evitar cobros reales en tests de integración)
// ---------------------------------------------------------------------------

const createStripeMethod = (defaultId: string): unknown =>
  vi.fn().mockResolvedValue({ id: defaultId });

vi.mock('@/shared/stripe', () => ({
  stripeClient: {
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
  },
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
// Mock: Storage (S3 / R2) para no subir archivos reales
// ---------------------------------------------------------------------------

vi.mock('@/shared/storage', () => ({
  uploadFile: vi.fn().mockResolvedValue({
    key: 'mock/key.pdf',
    size: 0,
    publicUrl: 'https://mock.example.com/mock/key.pdf',
  }),
  deleteFile: vi.fn().mockResolvedValue(undefined),
  getSignedUrl: vi.fn().mockResolvedValue('https://mock-signed-url.example.com/key'),
  getPublicUrl: vi.fn().mockImplementation((key: string) => `https://mock.example.com/${key}`),
  generateFileKey: vi.fn().mockReturnValue('evidencias/2025-02-01/mock-uuid.pdf'),
  storageConfig: {
    bucketName: 'test-bucket',
    publicUrl: 'https://mock.example.com',
  } as const,
  s3Client: {},
}));

// No se mockea @/shared/database: los tests de integración usan DATABASE_TEST_URL real.
// Asegúrate de tener migraciones aplicadas: NODE_ENV=test pnpm db:migrate
