import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictError, UnauthorizedError } from '@/shared/errors/index.js';
import type { UUID } from '@/shared/database/types.js';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../../types/auth.types.js';
import * as authService from '../auth.service.js';

const USER_ID = '11111111-1111-1111-1111-111111111111' as UUID;
const USER_EMAIL = 'test@example.com';
const USER_NAME = 'Test User';
const HASHED_PASSWORD = '$2b$10$hashedpassword';

const mockUserFindOne = vi.fn();
const mockUserCreate = vi.fn();
const mockUserFindByPk = vi.fn();

const mockRefreshTokenFindAll = vi.fn();
const mockRefreshTokenCreate = vi.fn();
const mockRefreshTokenUpdate = vi.fn();

const mockBcryptHash = vi.fn();
const mockBcryptCompare = vi.fn();

vi.mock('@/modules/users/models/user.model.js', () => ({
  User: {
    findOne: (...args: unknown[]) => mockUserFindOne(...args),
    create: (...args: unknown[]) => mockUserCreate(...args),
    findByPk: (...args: unknown[]) => mockUserFindByPk(...args),
  },
}));

vi.mock('@/modules/auth/models/refresh-token.model.js', () => ({
  RefreshToken: {
    findAll: (...args: unknown[]) => mockRefreshTokenFindAll(...args),
    create: (...args: unknown[]) => mockRefreshTokenCreate(...args),
    update: (...args: unknown[]) => mockRefreshTokenUpdate(...args),
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: (...args: unknown[]) => mockBcryptHash(...args),
    compare: (...args: unknown[]) => mockBcryptCompare(...args),
  },
}));

vi.mock('@/shared/logger/index.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnThis() },
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBcryptHash.mockResolvedValue(HASHED_PASSWORD);
    mockBcryptCompare.mockResolvedValue(true);
  });

  describe('register', () => {
    it('throws ConflictError when email already exists', async () => {
      mockUserFindOne.mockResolvedValueOnce({ id: USER_ID, email: USER_EMAIL });

      await expect(
        authService.register({
          email: USER_EMAIL,
          password: 'password123',
          name: USER_NAME,
        })
      ).rejects.toThrow(ConflictError);

      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { email: USER_EMAIL } });
      expect(mockUserCreate).not.toHaveBeenCalled();
    });

    it('creates user and refresh token and returns AuthResponse on success', async () => {
      mockUserFindOne.mockResolvedValueOnce(null);
      const createdUser = {
        id: USER_ID,
        email: USER_EMAIL,
        name: USER_NAME,
        password: HASHED_PASSWORD,
      };
      mockUserCreate.mockResolvedValueOnce(createdUser);
      mockRefreshTokenCreate.mockResolvedValueOnce({});

      const result = await authService.register({
        email: USER_EMAIL,
        password: 'password123',
        name: USER_NAME,
      });

      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({ id: USER_ID, email: USER_EMAIL, name: USER_NAME });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      expect(mockUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: USER_EMAIL,
          name: USER_NAME,
          password: HASHED_PASSWORD,
        })
      );
      expect(mockRefreshTokenCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_ID,
          token: expect.any(String),
          expiresAt: expect.any(Date),
        })
      );
    });
  });

  describe('login', () => {
    it('throws UnauthorizedError when user does not exist', async () => {
      mockUserFindOne.mockResolvedValueOnce(null);

      await expect(
        authService.login({
          email: USER_EMAIL,
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedError);

      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { email: USER_EMAIL } });
    });

    it('throws UnauthorizedError when password is invalid', async () => {
      mockUserFindOne.mockResolvedValueOnce({
        id: USER_ID,
        email: USER_EMAIL,
        name: USER_NAME,
        password: HASHED_PASSWORD,
      });
      mockBcryptCompare.mockResolvedValueOnce(false);

      await expect(
        authService.login({
          email: USER_EMAIL,
          password: 'wrongpassword',
        })
      ).rejects.toThrow(UnauthorizedError);

      expect(mockBcryptCompare).toHaveBeenCalledWith('wrongpassword', HASHED_PASSWORD);
    });

    it('returns AuthResponse with tokens on success', async () => {
      const user = {
        id: USER_ID,
        email: USER_EMAIL,
        name: USER_NAME,
        password: HASHED_PASSWORD,
      };
      mockUserFindOne.mockResolvedValueOnce(user);
      mockRefreshTokenCreate.mockResolvedValueOnce({});

      const result = await authService.login({
        email: USER_EMAIL,
        password: 'password123',
      });

      expect(result.user).toEqual({ id: USER_ID, email: USER_EMAIL, name: USER_NAME });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBeDefined();
    });
  });

  describe('validateToken', () => {
    it('returns payload for valid access token', () => {
      const payload: JWTPayload = { userId: USER_ID, email: USER_EMAIL, type: 'access' };
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
      const token = jwt.sign(
        wrongPayload,
        process.env['JWT_SECRET'] ?? 'test-secret-for-unit-tests',
        { expiresIn: '15m' }
      );

      expect(() => authService.validateToken(token)).toThrow(UnauthorizedError);
    });
  });

  describe('refreshAccessToken', () => {
    it('throws UnauthorizedError when no valid refresh token found', async () => {
      mockRefreshTokenFindAll.mockResolvedValueOnce([]);

      await expect(authService.refreshAccessToken('some-refresh-token')).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('throws UnauthorizedError when refresh token is expired', async () => {
      const expiredTokenRecord = {
        id: 'rt-id',
        userId: USER_ID,
        token: HASHED_PASSWORD,
        expiresAt: new Date(Date.now() - 86400000),
        update: vi.fn().mockResolvedValue(undefined),
      };
      mockRefreshTokenFindAll.mockResolvedValueOnce([expiredTokenRecord]);
      mockBcryptCompare.mockResolvedValueOnce(true);

      await expect(authService.refreshAccessToken('raw-refresh-token')).rejects.toThrow(
        UnauthorizedError
      );

      expect(expiredTokenRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({ revokedAt: expect.any(Date) })
      );
    });

    it('returns new access token when refresh token is valid', async () => {
      const futureExpiry = new Date(Date.now() + 86400000);
      const tokenRecord = {
        id: 'rt-id',
        userId: USER_ID,
        token: HASHED_PASSWORD,
        expiresAt: futureExpiry,
        update: vi.fn().mockResolvedValue(undefined),
      };
      mockRefreshTokenFindAll.mockResolvedValueOnce([tokenRecord]);
      mockBcryptCompare.mockResolvedValueOnce(true);
      mockUserFindByPk.mockResolvedValueOnce({
        id: USER_ID,
        email: USER_EMAIL,
        name: USER_NAME,
      });

      const result = await authService.refreshAccessToken('raw-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresIn');
      expect(mockUserFindByPk).toHaveBeenCalledWith(USER_ID);
    });

    it('throws UnauthorizedError when user not found for valid refresh token', async () => {
      const futureExpiry = new Date(Date.now() + 86400000);
      const tokenRecord = {
        id: 'rt-id',
        userId: USER_ID,
        token: HASHED_PASSWORD,
        expiresAt: futureExpiry,
        update: vi.fn().mockResolvedValue(undefined),
      };
      mockRefreshTokenFindAll.mockResolvedValueOnce([tokenRecord]);
      mockBcryptCompare.mockResolvedValueOnce(true);
      mockUserFindByPk.mockResolvedValueOnce(null);

      await expect(authService.refreshAccessToken('raw-refresh-token')).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe('revokeRefreshToken', () => {
    it('does nothing when token not found (idempotent)', async () => {
      mockRefreshTokenFindAll.mockResolvedValueOnce([]);
      mockBcryptCompare.mockResolvedValue(false);

      await expect(authService.revokeRefreshToken('unknown-token')).resolves.toBeUndefined();

      expect(mockRefreshTokenUpdate).not.toHaveBeenCalled();
    });

    it('revokes token when valid token found', async () => {
      const tokenRecord = {
        id: 'rt-id',
        userId: USER_ID,
        token: HASHED_PASSWORD,
        expiresAt: new Date(Date.now() + 86400000),
        update: vi.fn().mockResolvedValue(undefined),
      };
      mockRefreshTokenFindAll.mockResolvedValueOnce([tokenRecord]);
      mockBcryptCompare.mockResolvedValueOnce(true);

      await authService.revokeRefreshToken('raw-refresh-token');

      expect(tokenRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({ revokedAt: expect.any(Date) })
      );
    });
  });

  describe('revokeAllUserRefreshTokens', () => {
    it('calls RefreshToken.update with userId and revokedAt', async () => {
      mockRefreshTokenUpdate.mockResolvedValueOnce([1]);

      await authService.revokeAllUserRefreshTokens(USER_ID);

      expect(mockRefreshTokenUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ revokedAt: expect.any(Date) }),
        expect.objectContaining({
          where: { userId: USER_ID, revokedAt: null },
        })
      );
    });
  });
});
