import { z } from 'zod';
export declare const CreateOnboardingInvitationSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
}, z.core.$strip>;
export type CreateOnboardingInvitationDTO = z.infer<typeof CreateOnboardingInvitationSchema>;
//# sourceMappingURL=onboarding-invitation.validator.d.ts.map