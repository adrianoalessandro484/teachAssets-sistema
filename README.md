# TechAsset — Sistema de Gestión de Inventario y Préstamo de Equipos Tecnológicos

Aplicación web desarrollada para **Innovatech Solutions S.A.C.** con **ASP.NET Core (.NET 10)**, **PostgreSQL** y **React + Vite + Tailwind CSS + shadcn/ui**.

---

## Requisitos previos

* [.NET SDK 10](https://dotnet.microsoft.com/)
* [PostgreSQL 16+](https://www.postgresql.org/)
* [Node.js 20+](https://nodejs.org/) y `pnpm`

---

## Cómo ejecutar el proyecto en local

### 1. Clonar el repositorio

```bash
git clone https://github.com/adrianoalessandro484/teachAssets-sistema.git
cd teachAssets-sistema
```

### 2. Crear la base de datos en PostgreSQL

Crea la base de datos `techasset_db`:

```sql
CREATE DATABASE techasset_db;
```

Si tu usuario o contraseña de PostgreSQL es distinto a `postgres` / `123`, actualiza `ConnectionStrings:DefaultConnection` en `backend/Innovatech.API/appsettings.json`.

### 3. Descargar dependencias y levantar el Backend

```bash
cd backend
dotnet restore
dotnet run --project Innovatech.API/Innovatech.API.csproj
```

* API disponible en: `http://localhost:5065`
* Documentación Swagger: `http://localhost:5065/swagger`
* Al iniciar por primera vez se crean las tablas automáticamente y se cargan los usuarios y equipos iniciales.

### 4. Descargar dependencias y levantar el Frontend

En otra terminal, desde la raíz del proyecto:

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

* Aplicación web disponible en: `http://localhost:5173`

*(En Windows PowerShell puedes copiar el archivo de entorno con `Copy-Item .env.example .env`).*

---

## Credenciales de acceso iniciales

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@innovatech.com` | `Admin123!` |
| **Responsable de Tecnología** | `responsable@innovatech.com` | `Resp123!` |
| **Colaborador** | `colaborador@innovatech.com` | `Colab123!` |
