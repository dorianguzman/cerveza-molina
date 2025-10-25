# 🔐 Configuración de Autenticación - Molina App

## Descripción

Esta aplicación utiliza un sistema de autenticación de dos pasos:
1. **Password protegida**: Los usuarios deben ingresar una contraseña para acceder
2. **GitHub PAT requerido**: Todos los datos se sincronizan con GitHub (no hay localStorage)

## Paso 1: Configurar el Secret en GitHub

### 1.1 Ir a Settings del Repositorio
```
https://github.com/[tu-usuario]/cerveza-molina/settings/secrets/actions
```

### 1.2 Crear Nuevo Secret
- Click en **"New repository secret"**
- Name: `MOLINA_PASSWORD`
- Value: Tu contraseña deseada (ej: `MiPasswordSegura123!`)
- Click en **"Add secret"**

### 1.3 Ejecutar el Workflow
- Ve a la pestaña **"Actions"**
- Selecciona **"🔐 Generate Password Hash"**
- Click en **"Run workflow"**
- Click en el botón verde **"Run workflow"**

### 1.4 Verificar
Después de unos segundos, el workflow creará/actualizará el archivo `auth-hash.json` automáticamente.

## Paso 2: Configurar GitHub Personal Access Token (PAT)

### 2.1 Crear PAT en GitHub
1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Configuración:
   - **Note**: `Molina App Access`
   - **Expiration**: `No expiration` (o el tiempo que prefieras)
   - **Scopes**: Selecciona:
     - ✅ `repo` (Full control of private repositories)

4. Click en **"Generate token"**
5. **⚠️ IMPORTANTE**: Copia el token inmediatamente (no podrás verlo de nuevo)

### 2.2 Usar el PAT en la App
Al abrir la aplicación por primera vez:
1. Ingresa la contraseña configurada en el Step 1
2. Ingresa tu GitHub PAT cuando se solicite
3. El PAT se guardará de forma segura en sessionStorage

## Cómo Funciona

### Flujo de Autenticación
```
Usuario abre app
    ↓
Pantalla de Login: Ingresa password
    ↓
Valida password contra auth-hash.json (SHA-256)
    ↓
Si correcto: Solicita GitHub PAT
    ↓
Valida PAT haciendo una llamada de prueba a GitHub API
    ↓
Si correcto: Acceso concedido
    ↓
App carga datos desde GitHub
```

### Seguridad
- ✅ La contraseña NUNCA está en el código (solo el hash SHA-256)
- ✅ El hash no se puede revertir a la contraseña original
- ✅ GitHub PAT se almacena solo durante la sesión del navegador
- ✅ Todos los datos están en GitHub (no en localStorage)

## Cambiar la Contraseña

1. Actualiza el secret `MOLINA_PASSWORD` en GitHub Settings
2. Re-ejecuta el workflow **"🔐 Generate Password Hash"**
3. El archivo `auth-hash.json` se actualizará automáticamente

## Troubleshooting

### El workflow falla
- Verifica que el secret `MOLINA_PASSWORD` esté configurado correctamente
- Asegúrate de que el workflow tiene permisos de escritura

### No puedo iniciar sesión
- Verifica que `auth-hash.json` existe en el repositorio
- Prueba la contraseña que configuraste en el secret
- Si olvidaste la contraseña, cambia el secret y re-ejecuta el workflow

### Error con GitHub PAT
- Verifica que el PAT tiene el scope `repo` activado
- Verifica que el PAT no haya expirado
- Prueba generando un nuevo PAT

## Documentación Adicional

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [SHA-256 Hashing](https://en.wikipedia.org/wiki/SHA-2)
