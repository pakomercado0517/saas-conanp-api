import { z } from 'zod';
import { DateTime } from 'luxon';
/**
 * Schema Zod para validar DateTime ISO
 */
export declare const dateTimeSchema: z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<boolean>, string>>;
/**
 * Schema Zod para validar fecha solo (YYYY-MM-DD)
 */
export declare const dateOnlySchema: z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<boolean>, string>>;
/**
 * Schema Zod para validar hora solo (HH:mm:ss)
 */
export declare const timeOnlySchema: z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<boolean>, string>>;
/**
 * Schema Zod para validar rango de fechas
 */
export declare const dateRangeSchema: z.ZodObject<{
    startDate: z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<boolean>, string>>;
    endDate: z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<boolean>, string>>;
}, z.core.$strip>;
/**
 * Schema Zod opcional para DateTime
 */
export declare const optionalDateTimeSchema: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<boolean>, string>>>>;
/**
 * Schema Zod opcional para fecha solo
 */
export declare const optionalDateOnlySchema: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<boolean>, string>>>>;
/**
 * Schema Zod opcional para hora solo
 */
export declare const optionalTimeOnlySchema: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<boolean>, string>>>>;
/**
 * Schema Zod para validar que una fecha no esté en el pasado
 */
export declare const futureDateSchema: z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<boolean>, string>>;
/**
 * Schema Zod para validar que una fecha no esté en el futuro
 */
export declare const pastDateSchema: z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<boolean>, string>>;
//# sourceMappingURL=zod-schemas.d.ts.map