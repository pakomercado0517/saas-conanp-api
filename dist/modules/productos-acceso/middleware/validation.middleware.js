import { z } from 'zod';
import { CreateProductoAccesoSchema, UpdateProductoAccesoSchema, ListProductosAccesoSchema, } from '../validators/producto-acceso.validator.js';
import { EntradaStockSchema, SalidaStockSchema, ListMovimientosStockSchema, } from '../validators/movimiento-stock-acceso.validator.js';
const handleZodError = (res, error) => {
    const detalles = error.issues.map((err) => ({
        campo: err.path.join('.') || 'raíz',
        mensaje: err.message,
        codigo: err.code,
    }));
    res.status(400).json({
        success: false,
        error: 'Error de validación',
        message: 'Los datos proporcionados no son válidos',
        code: 'VALIDATION_ERROR',
        detalles,
    });
};
export const validateCreateProductoAcceso = (req, res, next) => {
    try {
        req.body = CreateProductoAccesoSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            handleZodError(res, error);
            return;
        }
        next(error);
    }
};
export const validateUpdateProductoAcceso = (req, res, next) => {
    try {
        req.body = UpdateProductoAccesoSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            handleZodError(res, error);
            return;
        }
        next(error);
    }
};
export const validateListProductosAcceso = (req, res, next) => {
    try {
        req.validatedQuery = ListProductosAccesoSchema.parse(req.query);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            handleZodError(res, error);
            return;
        }
        next(error);
    }
};
export const validateEntradaStock = (req, res, next) => {
    try {
        req.body = EntradaStockSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            handleZodError(res, error);
            return;
        }
        next(error);
    }
};
export const validateSalidaStock = (req, res, next) => {
    try {
        req.body = SalidaStockSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            handleZodError(res, error);
            return;
        }
        next(error);
    }
};
export const validateListMovimientosStock = (req, res, next) => {
    try {
        req.validatedQuery = ListMovimientosStockSchema.parse(req.query);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            handleZodError(res, error);
            return;
        }
        next(error);
    }
};
//# sourceMappingURL=validation.middleware.js.map