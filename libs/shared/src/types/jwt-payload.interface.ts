// Atributos del JwtPayload. 
// Cumpliendo el punto "3.1 Autenticación y contenido del JWT" del documento de "Microservicios"
export interface JwtPayload {
  sub: string;       // ID del usuario en la tabla auth.users
  email: string;     // Correo del usuario
  role: 'owner' | 'vet' | 'reception' | 'admin'; // Rol de autorización
  clientId?: string; // Solo si role = owner; ID del cliente en clients_pets
  
  iat?: number;      // Fecha de emisión en formato Epoch timestamp
  exp?: number;      // Fecha de expiración (15 minutos después del iat)
}