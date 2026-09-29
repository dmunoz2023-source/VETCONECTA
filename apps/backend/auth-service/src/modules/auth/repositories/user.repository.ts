import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  private users: User[] = []; // O la conexión a PostgreSQL con TypeORM/Prisma según corresponda

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      email: userData.email!,
      password: userData.password!,
      nombre: userData.nombre || 'Usuario',
      rol: userData.rol || 'CLIENTE',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }
}