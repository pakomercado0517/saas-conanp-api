import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CreateProductoAccesoSchema,
  UpdateProductoAccesoSchema,
  ListProductosAccesoSchema,
} from '../validators/producto-acceso.validator.js';
import {
  EntradaStockSchema,
  SalidaStockSchema,
  ListMovimientosStockSchema,
} from '../validators/movimiento-stock-acceso.validator.js';

const handleZodError = (res: Response, error: z.ZodError): void => {
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

export const validateCreateProductoAcceso = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = CreateProductoAccesoSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(res, error);
      return;
    }
    next(error);
  }
};

export const validateUpdateProductoAcceso = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = UpdateProductoAccesoSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(res, error);
      return;
    }
    next(error);
  }
};

export const validateListProductosAcceso = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.validatedQuery = ListProductosAccesoSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(res, error);
      return;
    }
    next(error);
  }
};

export const validateEntradaStock = (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.body = EntradaStockSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(res, error);
      return;
    }
    next(error);
  }
};

export const validateSalidaStock = (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.body = SalidaStockSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(res, error);
      return;
    }
    next(error);
  }
};

export const validateListMovimientosStock = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.validatedQuery = ListMovimientosStockSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(res, error);
      return;
    }
    next(error);
  }
};
