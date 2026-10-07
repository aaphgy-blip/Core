import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.ts';
import { UserRepository } from '../repositories/userRepository.ts';
import { User, UserPublicProfile, UserRole } from '../models/types.ts';
import { LoginDto, PrivilegedUserDto, RegisterDto, UpdateProfileDto } from '../schemas/validation.ts';
import { AuditService } from './auditService.ts';

export class AuthService {
  public static async register(dto: RegisterDto): Promise<{ user: UserPublicProfile; token: string }> {
    const existing = await UserRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userId = `usr_${crypto.randomUUID()}`;

    // Critical security constraint: Public registration strictly creates CUSTOMER
    const newUser: User = {
      id: userId,
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: 'customer',
      phone: dto.phone || '',
      profile_image: null,
      birthday: null,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await UserRepository.create(newUser);
    await AuditService.log('user.registered', 'user', newUser.id, { email: newUser.email, role: 'customer' }, newUser.id, 'customer');

    const token = this.generateToken(newUser);
    return { user: this.toPublicProfile(newUser), token };
  }

  public static async createPrivilegedUser(
    dto: PrivilegedUserDto,
    actor?: { id: string; role: string }
  ): Promise<{ user: UserPublicProfile; token: string }> {
    if (actor && actor.role !== 'master') {
      throw new Error('Acceso denegado: solo el rol master puede crear usuarios con roles privilegiados');
    }

    const existing = await UserRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userId = `usr_${dto.role}_${crypto.randomUUID()}`;

    const newUser: User = {
      id: userId,
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role,
      phone: dto.phone || '',
      profile_image: null,
      birthday: null,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await UserRepository.create(newUser);
    await AuditService.log(
      'user.privileged_created',
      'user',
      newUser.id,
      { email: newUser.email, role: newUser.role, created_by: actor?.id || 'seed' },
      actor?.id || 'system',
      actor?.role || 'master'
    );

    const token = this.generateToken(newUser);
    return { user: this.toPublicProfile(newUser), token };
  }

  public static async login(dto: LoginDto): Promise<{ user: UserPublicProfile; token: string }> {
    const user = await UserRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.is_active) {
      throw new Error('La cuenta se encuentra desactivada');
    }

    await AuditService.log('user.login', 'user', user.id, { email: user.email }, user.id, user.role);

    const token = this.generateToken(user);
    return { user: this.toPublicProfile(user), token };
  }

  public static generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
  }

  public static verifyToken(token: string): { id: string; email: string; role: UserRole; name: string } {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      return decoded;
    } catch {
      throw new Error('Token inválido o expirado');
    }
  }

  public static async getProfile(userId: string): Promise<UserPublicProfile | null> {
    const user = await UserRepository.findById(userId);
    if (!user) return null;
    return this.toPublicProfile(user);
  }

  public static async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserPublicProfile> {
    const existing = await UserRepository.findById(userId);
    if (!existing) {
      throw new Error('Usuario no encontrado');
    }

    const updates: Partial<User> = {};
    if (dto.name !== undefined) updates.name = dto.name.trim();
    if (dto.phone !== undefined) updates.phone = dto.phone.trim();
    if (dto.profile_image !== undefined) updates.profile_image = dto.profile_image;
    if (dto.birthday !== undefined) updates.birthday = dto.birthday;

    const updated = await UserRepository.update(userId, updates);
    if (!updated) throw new Error('Error al actualizar usuario');

    await AuditService.log('user.profile_updated', 'user', userId, updates, userId, existing.role);
    return this.toPublicProfile(updated);
  }

  public static toPublicProfile(user: User): UserPublicProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      profile_image: user.profile_image,
      birthday: user.birthday,
      is_active: user.is_active,
    };
  }
}
