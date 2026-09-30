import type { Client } from "../types/client.types";

// MOCK temporal: se elimina cuando useClients consuma GET /v1/clients.
export const CLIENTS_MOCK: Client[] = [
  { nombre: "María González", rut: "17.456.932-1", telefono: "+56 9 8765 4321", correo: "mgonzalez@gmail.com", mascotas: 2 },
  { nombre: "Carlos Muñoz", rut: "12.891.445-3", telefono: "+56 9 6234 8871", correo: "cmunoz@outlook.com", mascotas: 5 },
  { nombre: "Javiera Soto", rut: "19.234.567-8", telefono: "+56 9 7412 5590", correo: "jsoto@hotmail.com", mascotas: 1 },
  { nombre: "Andrés Reyes", rut: "15.678.321-K", telefono: "+56 9 5123 9087", correo: "areyes@gmail.com", mascotas: 3 },
  { nombre: "Camila Figueroa", rut: "20.112.889-2", telefono: "+56 9 9301 2244", correo: "cfigueroa@icloud.com", mascotas: 4 },
  { nombre: "Roberto Espinoza", rut: "11.345.670-5", telefono: "+56 9 8210 6653", correo: "respinoza@yahoo.com", mascotas: 7 },
  { nombre: "Valentina Pérez", rut: "18.903.214-0", telefono: "+56 9 4578 3312", correo: "vperez@gmail.com", mascotas: 1 },
  { nombre: "Fernando Kramer", rut: "14.221.098-7", telefono: "+56 9 3390 1187", correo: "fkramer@gmail.com", mascotas: 1 },
  { nombre: "Sebastián Torres", rut: "16.782.345-9", telefono: "+56 9 7788 2211", correo: "storres@gmail.com", mascotas: 2 },
];
