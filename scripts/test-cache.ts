/**
 * Script de prueba para verificar el sistema de caché
 *
 * Para ejecutar:
 * CACHE_ENABLED=true pnpm tsx scripts/test-cache.ts
 */

import { cache } from '../src/shared/cache/index.js';
import { CacheKeys } from '../src/shared/cache/keys.js';

async function testCache(): Promise<void> {
  console.log('🧪 Iniciando pruebas del sistema de caché...\n');

  // 1. Inicializar caché
  console.log('1️⃣ Inicializando caché...');
  cache.initialize();
  console.log(`   ✓ Caché inicializado (habilitado: ${cache.isEnabled()})\n`);

  // 2. Test de SET y GET
  console.log('2️⃣ Probando SET y GET...');
  const testKey = CacheKeys.organization('test-org-123');
  const testData = {
    id: 'test-org-123',
    name: 'Test Organization',
    ecosystem_type: 'marino',
    settings: {},
  };

  await cache.set(testKey, testData, 60);
  console.log(`   ✓ Dato guardado en caché: ${testKey}`);

  const retrieved = await cache.get(testKey);
  console.log(`   ✓ Dato recuperado del caché:`, retrieved);
  console.log(`   ✓ Match: ${JSON.stringify(retrieved) === JSON.stringify(testData)}\n`);

  // 3. Test de invalidación
  console.log('3️⃣ Probando invalidación (DEL)...');
  await cache.del(testKey);
  const afterDelete = await cache.get(testKey);
  console.log(`   ✓ Caché invalidado`);
  console.log(`   ✓ Resultado después de DEL: ${afterDelete}\n`);

  // 4. Test de múltiples keys
  console.log('4️⃣ Probando múltiples cache keys...');
  const keys = [
    CacheKeys.organization('org-1'),
    CacheKeys.organization('org-2'),
    CacheKeys.activeSubscription('org-1'),
    CacheKeys.subscriptionPlan('plan-123'),
  ];

  for (const key of keys) {
    await cache.set(key, { key, timestamp: Date.now() }, 60);
  }
  console.log(`   ✓ ${keys.length} keys guardadas en caché\n`);

  // 5. Test de invalidación múltiple
  console.log('5️⃣ Probando invalidación múltiple...');
  await cache.del([keys[0], keys[1]]);
  console.log(`   ✓ 2 keys invalidadas\n`);

  // 6. Test de actividades
  console.log('6️⃣ Probando cache keys de actividades...');
  const actividadKey = CacheKeys.actividad('org-1', 'actividad-123');
  const actividadesKey = CacheKeys.actividades('org-1');

  await cache.set(actividadKey, { id: 'actividad-123', name: 'Snorkel' }, 60);
  await cache.set(actividadesKey, [{ id: 'actividad-123', name: 'Snorkel' }], 60);

  console.log(`   ✓ Cache key individual: ${actividadKey}`);
  console.log(`   ✓ Cache key lista: ${actividadesKey}\n`);

  // 7. Test de flush (limpiar todo)
  console.log('7️⃣ Probando FLUSH (limpiar todo el caché)...');
  await cache.flush();
  const afterFlush = await cache.get(actividadesKey);
  console.log(`   ✓ Caché limpiado`);
  console.log(`   ✓ Resultado después de FLUSH: ${afterFlush}\n`);

  // 8. Cleanup
  console.log('8️⃣ Cerrando conexión...');
  await cache.disconnect();
  console.log(`   ✓ Conexión cerrada\n`);

  console.log('✅ Todas las pruebas completadas exitosamente!');
}

testCache().catch((error) => {
  console.error('❌ Error en las pruebas:', error);
  process.exit(1);
});
