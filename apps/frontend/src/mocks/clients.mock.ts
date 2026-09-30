import type { Client } from "../types/client.types";

// MOCK temporal: se elimina cuando useClients consuma GET /v1/clients.
export const CLIENTS_MOCK: Client[] = [
  { first_name: "María", last_name: "González", rut: "17.456.932-1", phone: "+56 9 8765 4321", email: "mgonzalez@gmail.com", pets: 2 },
  { first_name: "Carlos", last_name: "Muñoz", rut: "12.891.445-3", phone: "+56 9 6234 8871", email: "cmunoz@outlook.com", pets: 5 },
  { first_name: "Javiera", last_name: "Soto", rut: "19.234.567-8", phone: "+56 9 7412 5590", email: "jsoto@hotmail.com", pets: 1 },
  { first_name: "Andrés", last_name: "Reyes", rut: "15.678.321-K", phone: "+56 9 5123 9087", email: "areyes@gmail.com", pets: 3 },
  { first_name: "Camila", last_name: "Figueroa", rut: "20.112.889-2", phone: "+56 9 9301 2244", email: "cfigueroa@icloud.com", pets: 4 },
  { first_name: "Roberto", last_name: "Espinoza", rut: "11.345.670-5", phone: "+56 9 8210 6653", email: "respinoza@yahoo.com", pets: 7 },
  { first_name: "Valentina", last_name: "Pérez", rut: "18.903.214-0", phone: "+56 9 4578 3312", email: "vperez@gmail.com", pets: 1 },
  { first_name: "Fernando", last_name: "Kramer", rut: "14.221.098-7", phone: "+56 9 3390 1187", email: "fkramer@gmail.com", pets: 1 },
  { first_name: "Sebastián", last_name: "Torres", rut: "16.782.345-9", phone: "+56 9 7788 2211", email: "storres@gmail.com", pets: 2 },
];
