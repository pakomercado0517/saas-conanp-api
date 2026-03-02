import { Op } from 'sequelize';
import { User } from '../../modules/users/models/user.model.js';
import { DependenciaMembership } from '../../modules/dependencias/models/dependencia-membership.model.js';
import { Area } from '../../modules/areas/models/area.model.js';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors/index.js';
/**
 * Middleware que exige que el usuario haya completado el onboarding
 * (no estar en estado pending_setup).
 *
 * Debe usarse después de authenticate.
 */
export const requireOnboardingComplete = async (req, _res, next) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new UnauthorizedError('Token de autenticación requerido');
    }
    const user = await User.findByPk(userId);
    if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
    }
    if (user.onboardingStatus === 'pending_setup') {
        const depMemberships = await DependenciaMembership.findAll({
            where: {
                userId,
                status: 'activo',
            },
            attributes: ['dependenciaId'],
        });
        const dependenciaIds = depMemberships.map((m) => m.dependenciaId);
        if (dependenciaIds.length > 0) {
            const createdAreaCount = await Area.count({
                where: {
                    dependenciaId: { [Op.in]: dependenciaIds },
                },
            });
            if (createdAreaCount > 0) {
                await user.update({ onboardingStatus: 'completed' });
                next();
                return;
            }
        }
        throw new ForbiddenError('Debes completar el onboarding (crear tu dependencia y área inicial) antes de usar esta sección');
    }
    next();
};
//# sourceMappingURL=onboarding.middleware.js.map