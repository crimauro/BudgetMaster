# BudgetMaster

## Estructura del Proyecto

El proyecto BudgetMaster está organizado en una arquitectura limpia con los siguientes componentes:

- **BudgetMaster_Backend/**
  - **BudgetMaster.API**: API REST que expone los endpoints del sistema
  - **BudgetMaster.Application**: Lógica de aplicación, DTOs, servicios y validadores
  - **BudgetMaster.Domain**: Entidades de dominio, interfaces y reglas de negocio
  - **BudgetMaster.Infrastructure**: Implementaciones de repositorios, configuración de base de datos y migraciones

## Cómo ejecutar el proyecto

### Configuración de la base de datos

Ejecuta uno de los siguientes scripts para configurar la base de datos:

- PowerShell: `.\setup-database.ps1`
- Batch: `setup-database.bat`

### Ejecutar la API

Para iniciar la API, ejecuta:

```
.\run-api.bat
```

O navega a la carpeta del proyecto API y ejecuta:

```
cd BudgetMaster_Backend\BudgetMaster.API
dotnet run
```

### Probar la API

Para probar que la API está funcionando correctamente:

```
.\test-api.ps1
```

Este script realizará pruebas de autenticación y acceso a datos básicos.