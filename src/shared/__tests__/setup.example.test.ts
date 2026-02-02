import { describe, it, expect } from 'vitest';
import { sequelize, testConnection } from '@/shared/database';
import { stripeClient, getDefaultCurrency } from '@/shared/stripe';
import {
  uploadFile,
  deleteFile,
  getSignedUrl,
  getPublicUrl,
  generateFileKey,
} from '@/shared/storage';

/**
 * Test de humo: verifica que los mocks de BD, Stripe y S3 están activos.
 * No hace llamadas reales a servicios externos.
 */
describe('Entorno de testing y mocks', () => {
  it('usa mock de Sequelize (no conecta a BD real)', async () => {
    await testConnection();
    await sequelize.authenticate();
    expect(sequelize.authenticate).toHaveBeenCalled();
  });

  it('usa mock de Stripe', async () => {
    const balance = await stripeClient.balance.retrieve();
    expect(stripeClient.balance.retrieve).toHaveBeenCalled();
    expect(balance).toHaveProperty('available');
    expect(getDefaultCurrency()).toBe('mxn');
  });

  it('usa mock de Storage (S3/R2)', async () => {
    const upload = await uploadFile({
      key: 'test/key',
      body: Buffer.from('test'),
      contentType: 'application/octet-stream',
    });
    expect(upload).toHaveProperty('key');
    expect(upload.publicUrl).toBeDefined();

    await deleteFile('test/key');
    expect(deleteFile).toHaveBeenCalledWith('test/key');

    const signed = await getSignedUrl({ key: 'test/key' });
    expect(signed).toContain('https');

    expect(getPublicUrl('test/key')).toContain('test/key');
    expect(generateFileKey('evidencias', 'pdf')).toContain('evidencias');
  });
});
