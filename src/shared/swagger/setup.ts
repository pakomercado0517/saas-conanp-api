/**
 * Setup de extensión de Zod para OpenAPI
 * IMPORTANTE: Este archivo DEBE importarse ANTES de cualquier otro módulo
 * que use Zod con funcionalidad OpenAPI (.openapi())
 */
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extender Zod globalmente UNA sola vez
extendZodWithOpenApi(z);

export { z };
