import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';

extendZodWithOpenApi(z);

export const CreateOnboardingInvitationSchema = registry.register(
  'CreateOnboardingInvitation',
  z
    .object({
      email: z
        .string()
        .email('El email debe ser válido')
        .max(255)
        .transform((val) => val.trim().toLowerCase())
        .describe('Email del primer administrador invitado para onboarding'),
    })
    .openapi({
      example: { email: 'primer.admin@conanp.gob.mx' },
    })
);

export type CreateOnboardingInvitationDTO = z.infer<typeof CreateOnboardingInvitationSchema>;

