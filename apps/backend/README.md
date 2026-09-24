## Backend — VetConecta

Guía oficial de desarrollo, arquitectura y ejecución local para los servicios del backend de VetConecta.  

---  

## Reglas Clave del Monorepo

1. **Instalación Centralizada:** NUNCA ejecutes `npm install` dentro de las carpetas individuales de los microservicios. Todo paquete y dependencia se instala desde la raíz del repositorio (`VETCONECTA/`).  
2. **Nuevas Dependencias:** Si necesitas instalar una librería para un microservicio específico, hazlo desde la raíz usando el modificador `--workspace`: 
   
   ```bash
   npm install <paquete> --workspace=apps/backend/<nombre-servicio>
   ```

3. Dependencias Globales: Las herramientas de compilación y linters compartidos se instalan en la raíz con -D:
   
   ```bash
   npm install -D <herramienta>
   ```
   
   
   

4. Variables de Entorno: Copia el archivo .env.example como .env dentro de la carpeta del microservicio correspondiente antes de levantarlo. Nunca subas archivos .env reales al repositorio Git.

5. Código Compartido (libs/shared): Todos los guards, decoradores, filtros globales e interfaces comunes deben residir en libs/shared para evitar duplicación de código.

## Mapeo de Servicios, Puertos y Esquemas de Base de Datos

Cada servicio corre de forma aislada en un puerto dedicado sobre una única instancia de PostgreSQL particionada en esquemas lógicos:

|                          |        |                       |               |                                                                               |
| ------------------------ | ------ | --------------------- | ------------- | ----------------------------------------------------------------------------- |
| Servicio                 | Puerto | Prefijo / Ruta Base   | Esquema DB    | Responsabilidad Principal                                                     |
| api-gateway              | :3000  | /v1/*                 | —             | Terminación de JWT, ruteo 1:1, traza de peticiones y Swagger consolidado      |
| auth-service             | :3001  | /v1/auth              | auth          | Identidad, credenciales (bcrypt), emisión de JWT y gestión de roles           |
| clients-pets-service     | :3002  | /v1/clients, /v1/pets | clients_pets  | Fichas de dueños y pacientes, cálculo dinámico de edad y baja lógica          |
| clinical-records-service | :3003  | /v1/clinical          | clinical      | Carnet digital de solo lectura, eventos médicos e historial de tratamientos   |
| scheduling-service       | :3004  | /v1/scheduling        | scheduling    | Bloques de disponibilidad, agenda de citas transaccional y calificaciones     |
| notifications-service    | :3005  | /v1/notifications     | notifications | Registro de tokens push (FCM/APNs), recordatorios 24 h y correo institucional |
| clinic-catalog-service   | :3006  | /v1/catalog           | catalog       | Información institucional, teléfono de urgencias y catálogo de especialidades |

## Comandos de Ejecución Local (Desde la Raíz)

Para iniciar cualquier servicio en modo de desarrollo con recarga automática en caliente (hot-reload), ejecuta desde el directorio raíz (VETCONECTA/):



```bash
# API Gateway

npm run start:dev --workspace=apps/backend/api-gateway

# Auth Service

npm run start:dev --workspace=apps/backend/auth-service

# Clients & Pets Service

npm run start:dev --workspace=apps/backend/clients-pets-service

# Clinical Records Service

npm run start:dev --workspace=apps/backend/clinical-records-service

# Scheduling Service

npm run start:dev --workspace=apps/backend/scheduling-service

# Notifications Service

npm run start:dev --workspace=apps/backend/notifications-service

# Clinic Catalog Service

npm run start:dev --workspace=apps/backend/clinic-catalog-service

```

## Arquitectura Interna en Tres Capas

Cada microservicio mantiene estrictamente la separación de responsabilidades dentro de su carpeta src/:

```tex
src/  
├── config/                     # Variables de entorno tipadas y esquemas de validación  
├── modules/  
│   └── <dominio>/
│       ├── controllers/        # CAPA PRESENTACIÓN: Rutas HTTP, códigos de respuesta y DTOs  
│       ├── services/           # CAPA APLICACIÓN: Reglas de negocio del SRS y lógica pura  
│       ├── repositories/       # CAPA PERSISTENCIA: Acceso exclusivo a tablas de su esquema PostgreSQL  
│       ├── entities/           # Modelos de base de datos  
│       └── dto/                # Data Transfer Objects con validaciones class-validator  
├── internal/                   # Endpoints privados (/internal) protegidos por X-Internal-Key  
├── clients/                    # Clientes HTTP hacia otros microservicios (llamadas /internal)  
├── app.module.ts               # Módulo raíz del microservicio  
└── main.ts                     # Bootstrap, ValidationPipe global y puerto
```



### Reglas de Diseño y Persistencia:

- Prohibición de Consultas Cruzadas: Ningún repositorio puede consultar ni realizar JOIN hacia tablas pertenecientes a esquemas ajenos.

- Desacoplamiento de Claves Foráneas: No existen restricciones FOREIGN KEY físicas entre diferentes esquemas. Los identificadores externos se almacenan como UUID planos y su existencia se valida mediante peticiones HTTP a rutas /internal.

- Protección de Rutas Internas: Los endpoints bajo /internal son de uso exclusivo inter-servicio, no se publican en el API Gateway y requieren la cabecera compartida X-Internal-Key.


