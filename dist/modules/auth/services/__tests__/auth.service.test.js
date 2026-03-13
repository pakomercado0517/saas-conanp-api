import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictError, UnauthorizedError, BadRequestError } from '../../../../shared/errors/index.js';
import jwt from 'jsonwebtoken';
import * as authService from '../auth.service.js';
const USER_ID = '11111111-1111-1111-1111-111111111111';
const USER_EMAIL = 'test@example.com';
const USER_NAME = 'Test User';
const HASHED_PASSWORD = '$2b$10$hashedpassword';
const mockUserFindOne = vi.fn();
const mockUserCreate = vi.fn();
const mockUserFindByPk = vi.fn();
const mockRefreshTokenFindOne = vi.fn();
const mockRefreshTokenFindAll = vi.fn();
const mockRefreshTokenCreate = vi.fn();
const mockRefreshTokenUpdate = vi.fn();
const mockBcryptHash = vi.fn();
const mockBcryptCompare = vi.fn();
vi.mock('@/modules/users/models/user.model.js', () => ({
    User: {
        findOne: (...args) => mockUserFindOne(...args),
        findAll: (...args) => mockUserFindAll(...args),
        create: (...args) => mockUserCreate(...args),
        findByPk: (...args) => mockUserFindByPk(...args),
    },
}));
vi.mock('@/modules/auth/models/refresh-token.model.js', () => ({
    RefreshToken: {
        findOne: (...args) => mockRefreshTokenFindOne(...args),
        findAll: (...args) => mockRefreshTokenFindAll(...args),
        create: (...args) => mockRefreshTokenCreate(...args),
        update: (...args) => mockRefreshTokenUpdate(...args),
    },
}));
vi.mock('bcrypt', () => ({
    default: {
        hash: (...args) => mockBcryptHash(...args),
        compare: (...args) => mockBcryptCompare(...args),
    },
}));
vi.mock('@/shared/logger/index.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnThis() },
}));
vi.mock('@/shared/email/index.js', () => ({
    sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));
const mockUserFindAll = vi.fn();
describe('auth.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockBcryptHash.mockResolvedValue(HASHED_PASSWORD);
        mockBcryptCompare.mockResolvedValue(true);
    });
    describe('register', () => {
        it('throws ConflictError when email already exists', async () => {
            mockUserFindOne.mockResolvedValueOnce({ id: USER_ID, email: USER_EMAIL });
            await expect(authService.register({
                email: USER_EMAIL,
                password: 'password123',
                name: USER_NAME,
            })).rejects.toThrow(ConflictError);
            expect(mockUserFindOne).toHaveBeenCalledWith({ where: { email: USER_EMAIL } });
            expect(mockUserCreate).not.toHaveBeenCalled();
        });
        it('creates user with emailVerified false and returns RegisterResponse (sin tokens)', async () => {
            mockUserFindOne.mockResolvedValueOnce(null);
            const createdUser = {
                id: USER_ID,
                email: USER_EMAIL,
                name: USER_NAME,
                password: HASHED_PASSWORD,
            };
            mockUserCreate.mockResolvedValueOnce(createdUser);
            const result = await authService.register({
                email: USER_EMAIL,
                password: 'password123',
                name: USER_NAME,
            });
            expect(result).toHaveProperty('user');
            expect(result.user).toEqual({ id: USER_ID, email: USER_EMAIL, name: USER_NAME });
            expect(result).toHaveProperty('message');
            expect(result).not.toHaveProperty('accessToken');
            expect(result).not.toHaveProperty('refreshToken');
            expect(mockUserCreate).toHaveBeenCalledWith(expect.objectContaining({
                email: USER_EMAIL,
                name: USER_NAME,
                password: HASHED_PASSWORD,
                emailVerified: false,
                emailVerificationToken: expect.any(String),
                emailVerificationExpiresAt: expect.any(Date),
            }));
            expect(mockRefreshTokenCreate).not.toHaveBeenCalled();
        });
    });
    describe('login', () => {
        it('throws UnauthorizedError when user does not exist', async () => {
            mockUserFindOne.mockResolvedValueOnce(null);
            await expect(authService.login({
                email: USER_EMAIL,
                password: 'password123',
            })).rejects.toThrow(UnauthorizedError);
            expect(mockUserFindOne).toHaveBeenCalledWith({ where: { email: USER_EMAIL } });
        });
        it('throws UnauthorizedError when email is not verified', async () => {
            mockUserFindOne.mockResolvedValueOnce({
                id: USER_ID,
                email: USER_EMAIL,
                name: USER_NAME,
                password: HASHED_PASSWORD,
                emailVerified: false,
            });
            await expect(authService.login({
                email: USER_EMAIL,
                password: 'password123',
            })).rejects.toThrow(UnauthorizedError);
            expect(mockBcryptCompare).not.toHaveBeenCalled();
            expect(mockRefreshTokenCreate).not.toHaveBeenCalled();
        });
        it('throws UnauthorizedError when password is invalid', async () => {
            mockUserFindOne.mockResolvedValueOnce({
                id: USER_ID,
                email: USER_EMAIL,
                name: USER_NAME,
                password: HASHED_PASSWORD,
                emailVerified: true,
            });
            mockBcryptCompare.mockResolvedValueOnce(false);
            await expect(authService.login({
                email: USER_EMAIL,
                password: 'wrongpassword',
            })).rejects.toThrow(UnauthorizedError);
            expect(mockBcryptCompare).toHaveBeenCalledWith('wrongpassword', HASHED_PASSWORD);
        });
        it('returns AuthResponseWithRefreshCookie (accessToken + _refreshTokenPlain) on success', async () => {
            const user = {
                id: USER_ID,
                email: USER_EMAIL,
                name: USER_NAME,
                password: HASHED_PASSWORD,
                emailVerified: true,
            };
            mockUserFindOne.mockResolvedValueOnce(user);
            mockRefreshTokenCreate.mockResolvedValueOnce({});
            const result = await authService.login({
                email: USER_EMAIL,
                password: 'password123',
            });
            expect(result.user).toEqual({ id: USER_ID, email: USER_EMAIL, name: USER_NAME });
            expect(result.accessToken).toBeDefined();
            expect(result._refreshTokenPlain).toBeDefined();
            expect(result.expiresIn).toBeDefined();
            expect(result).not.toHaveProperty('refreshToken');
            expect(mockRefreshTokenCreate).toHaveBeenCalledWith(expect.objectContaining({
                userId: USER_ID,
                tokenId: expect.any(String),
                token: expect.any(String),
                expiresAt: expect.any(Date),
            }));
        });
    });
    describe('validateToken', () => {
        it('returns payload for valid access token', () => {
            const payload = { userId: USER_ID, email: USER_EMAIL, type: 'access' };
            const token = jwt.sign(payload, process.env['JWT_SECRET'] ?? 'test-secret-for-unit-tests', {
                expiresIn: '15m',
            });
            const decoded = authService.validateToken(token);
            expect(decoded).toMatchObject({ userId: USER_ID, email: USER_EMAIL, type: 'access' });
        });
        it('throws UnauthorizedError for invalid token', () => {
            expect(() => authService.validateToken('invalid-token')).toThrow(UnauthorizedError);
        });
        it('throws UnauthorizedError for token with wrong type', () => {
            const wrongPayload = { userId: USER_ID, email: USER_EMAIL, type: 'refresh' };
            const token = jwt.sign(wrongPayload, process.env['JWT_SECRET'] ?? 'test-secret-for-unit-tests', { expiresIn: '15m' });
            expect(() => authService.validateToken(token)).toThrow(UnauthorizedError);
        });
    });
    describe('refreshAccessToken', () => {
        it('throws UnauthorizedError when no refresh token found by tokenId', async () => {
            mockRefreshTokenFindOne.mockResolvedValueOnce(null);
            await expect(authService.refreshAccessToken('some-refresh-token')).rejects.toThrow(UnauthorizedError);
            expect(mockRefreshTokenFindOne).toHaveBeenCalledWith({
                where: { tokenId: 'some-refresh-tok', revokedAt: null },
            });
        });
        it('throws UnauthorizedError when refresh token is expired', async () => {
            const expiredTokenRecord = {
                id: 'rt-id',
                userId: USER_ID,
                tokenId: 'raw-refresh-token'.substring(0, 16),
                token: HASHED_PASSWORD,
                expiresAt: new Date(Date.now() - 86400000),
                update: vi.fn().mockResolvedValue(undefined),
            };
            mockRefreshTokenFindOne.mockResolvedValueOnce(expiredTokenRecord);
            mockBcryptCompare.mockResolvedValueOnce(true);
            await expect(authService.refreshAccessToken('raw-refresh-token')).rejects.toThrow(UnauthorizedError);
            expect(expiredTokenRecord.update).toHaveBeenCalledWith(expect.objectContaining({ revokedAt: expect.any(Date) }));
        });
        it('returns new access token when refresh token is valid', async () => {
            const futureExpiry = new Date(Date.now() + 86400000);
            const tokenRecord = {
                id: 'rt-id',
                userId: USER_ID,
                tokenId: 'raw-refresh-token'.substring(0, 16),
                token: HASHED_PASSWORD,
                expiresAt: futureExpiry,
                update: vi.fn().mockResolvedValue(undefined),
            };
            mockRefreshTokenFindOne.mockResolvedValueOnce(tokenRecord);
            mockBcryptCompare.mockResolvedValueOnce(true);
            mockUserFindByPk.mockResolvedValueOnce({
                id: USER_ID,
                email: USER_EMAIL,
                name: USER_NAME,
            });
            const result = await authService.refreshAccessToken('raw-refresh-token');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('expiresIn');
            expect(mockRefreshTokenFindOne).toHaveBeenCalledWith({
                where: { tokenId: 'raw-refresh-token'.substring(0, 16), revokedAt: null },
            });
            expect(mockUserFindByPk).toHaveBeenCalledWith(USER_ID);
        });
        it('throws UnauthorizedError when user not found for valid refresh token', async () => {
            const futureExpiry = new Date(Date.now() + 86400000);
            const tokenRecord = {
                id: 'rt-id',
                userId: USER_ID,
                tokenId: 'raw-refresh-token'.substring(0, 16),
                token: HASHED_PASSWORD,
                expiresAt: futureExpiry,
                update: vi.fn().mockResolvedValue(undefined),
            };
            mockRefreshTokenFindOne.mockResolvedValueOnce(tokenRecord);
            mockBcryptCompare.mockResolvedValueOnce(true);
            mockUserFindByPk.mockResolvedValueOnce(null);
            await expect(authService.refreshAccessToken('raw-refresh-token')).rejects.toThrow(UnauthorizedError);
        });
    });
    describe('revokeRefreshToken', () => {
        it('does nothing when token not found by tokenId (idempotent)', async () => {
            mockRefreshTokenFindOne.mockResolvedValueOnce(null);
            await expect(authService.revokeRefreshToken('unknown-token')).resolves.toBeUndefined();
            expect(mockRefreshTokenUpdate).not.toHaveBeenCalled();
        });
        it('revokes token when valid token found by tokenId', async () => {
            const tokenRecord = {
                id: 'rt-id',
                userId: USER_ID,
                tokenId: 'raw-refresh-token'.substring(0, 16),
                token: HASHED_PASSWORD,
                expiresAt: new Date(Date.now() + 86400000),
                update: vi.fn().mockResolvedValue(undefined),
            };
            mockRefreshTokenFindOne.mockResolvedValueOnce(tokenRecord);
            mockBcryptCompare.mockResolvedValueOnce(true);
            await authService.revokeRefreshToken('raw-refresh-token');
            expect(tokenRecord.update).toHaveBeenCalledWith(expect.objectContaining({ revokedAt: expect.any(Date) }));
        });
    });
    describe('revokeAllUserRefreshTokens', () => {
        it('calls RefreshToken.update with userId and revokedAt', async () => {
            mockRefreshTokenUpdate.mockResolvedValueOnce([1]);
            await authService.revokeAllUserRefreshTokens(USER_ID);
            expect(mockRefreshTokenUpdate).toHaveBeenCalledWith(expect.objectContaining({ revokedAt: expect.any(Date) }), expect.objectContaining({
                where: { userId: USER_ID, revokedAt: null },
            }));
        });
    });
    describe('forgotPassword', () => {
        it('no hace nada cuando el usuario no existe', async () => {
            mockUserFindOne.mockResolvedValueOnce(null);
            await expect(authService.forgotPassword('nobody@example.com')).resolves.toBeUndefined();
            expect(mockUserFindAll).not.toHaveBeenCalled();
        });
        it('envía email y actualiza usuario cuando existe', async () => {
            const userWithUpdate = {
                id: USER_ID,
                email: USER_EMAIL,
                name: USER_NAME,
                update: vi.fn().mockResolvedValue(undefined),
            };
            mockUserFindOne.mockResolvedValueOnce(userWithUpdate);
            await authService.forgotPassword(USER_EMAIL);
            expect(userWithUpdate.update).toHaveBeenCalledWith(expect.objectContaining({
                passwordResetToken: expect.any(String),
                passwordResetExpiresAt: expect.any(Date),
            }));
        });
    });
    describe('resetPassword', () => {
        it('throws BadRequestError con token inválido', async () => {
            await expect(authService.resetPassword('short', 'newpassword123')).rejects.toThrow(BadRequestError);
        });
        it('throws BadRequestError cuando token no coincide o expiró', async () => {
            mockUserFindAll.mockResolvedValueOnce([]);
            await expect(authService.resetPassword('a'.repeat(32), 'newpassword123')).rejects.toThrow(BadRequestError);
        });
        it('actualiza contraseña cuando token es válido', async () => {
            const userWithUpdate = {
                id: USER_ID,
                email: USER_EMAIL,
                passwordResetToken: HASHED_PASSWORD,
                update: vi.fn().mockResolvedValue(undefined),
            };
            mockUserFindAll.mockResolvedValueOnce([userWithUpdate]);
            mockBcryptCompare.mockResolvedValueOnce(true);
            mockBcryptHash.mockResolvedValueOnce('$2b$10$newhashedpassword');
            await authService.resetPassword('valid-token-64-chars-hex-string-here', 'newpassword123');
            expect(userWithUpdate.update).toHaveBeenCalledWith({
                password: '$2b$10$newhashedpassword',
                passwordResetToken: null,
                passwordResetExpiresAt: null,
            });
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map