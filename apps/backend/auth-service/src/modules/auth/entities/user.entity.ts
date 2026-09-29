export class User {
  id!: string;
  email!: string;
  password!: string; // Hash encriptado con bcrypt
  nombre!: string;
  rol!: string; // ej: 'ADMIN', 'VETERINARIO', 'CLIENTE'
  activo!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

