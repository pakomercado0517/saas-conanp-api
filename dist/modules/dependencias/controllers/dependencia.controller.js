import * as dependenciaService from '../services/dependencia.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, } from '../../../shared/responses/helpers.js';
export const createDependencia = async (req, res) => {
    const userId = req.user.userId;
    const data = req.body;
    const result = await dependenciaService.createDependencia(data, userId);
    return sendCreated(res, result, 'Dependencia creada exitosamente');
};
export const listDependencias = async (req, res) => {
    const userId = req.user.userId;
    const requestWithValidatedQuery = req;
    const filters = requestWithValidatedQuery.validatedQuery ?? req.query;
    const { data, pagination } = await dependenciaService.listDependencias(filters, userId);
    return sendPaginated(res, data, pagination, 'Dependencias obtenidas exitosamente');
};
export const getDependenciaById = async (req, res) => {
    const userId = req.user.userId;
    const dependenciaId = req.dependenciaId;
    const result = await dependenciaService.getDependenciaById(dependenciaId, userId);
    return sendSuccess(res, result, 'Dependencia obtenida exitosamente');
};
export const updateDependencia = async (req, res) => {
    const userId = req.user.userId;
    const dependenciaId = req.dependenciaId;
    const data = req.body;
    const result = await dependenciaService.updateDependencia(dependenciaId, data, userId);
    return sendSuccess(res, result, 'Dependencia actualizada exitosamente');
};
export const deleteDependencia = async (req, res) => {
    const userId = req.user.userId;
    const dependenciaId = req.dependenciaId;
    await dependenciaService.deleteDependencia(dependenciaId, userId);
    return sendNoContent(res);
};
export const createAreaUnderDependencia = async (req, res) => {
    const userId = req.user.userId;
    const dependenciaId = req.dependenciaId;
    const data = req.body;
    const result = await dependenciaService.createAreaUnderDependencia(dependenciaId, data, userId);
    return sendCreated(res, result, 'Área creada exitosamente');
};
export const listAreasByDependencia = async (req, res) => {
    const userId = req.user.userId;
    const dependenciaId = req.dependenciaId;
    const data = await dependenciaService.listAreasByDependencia(dependenciaId, userId);
    return sendSuccess(res, data, 'Áreas obtenidas exitosamente');
};
//# sourceMappingURL=dependencia.controller.js.map