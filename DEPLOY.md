# Guía de Despliegue en Proxmox (Versión Limpia)

Después de los problemas anteriores, esta guía se centra en la forma **más estable y sencilla** de desplegar tu aplicación, evitando los problemas de permisos de la versión anterior.

## ELEGIR TU CAMINO

Tienes dos opciones. **Te recomiendo la Opción A** para no tener ningún dolor de cabeza.

### OPCIÓN A: Máquina Virtual (VM) - ⭐ RECOMENDADO
Es como tener un servidor real. Docker funciona perfecto aquí sin configurar nada extra.
1. Crea una **VM** en Proxmox (no un CT).
2. Instala **Ubuntu Server 24.04** o **Debian 12**.
3. Sigue los pasos de instalación de abajo.

### OPCIÓN B: Contenedor Privilegiado (LXC Privileged)
Si prefieres usar un contenedor porque consume menos RAM:
1. Crea un CT nuevo.
2. En la pestaña General, **DESMARCA** la casilla `Unprivileged container`.
3. En la pestaña Options, activa **Features > Nesting**.
4. Sigue los pasos de instalación de abajo.

---

## 1. INSTALACIÓN (En tu VM o CT)

Entra en la consola de tu nuevo servidor y ejecuta:

```bash
# 0. Actualizar e instalar herramientas básicas
apt update && apt upgrade -y
apt install -y curl

# 1. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Crear carpeta de la app
mkdir -p /opt/mikines-kitchen
cd /opt/mikines-kitchen

# IMPORTANTE: Dar permisos totales a las carpetas de datos
# (Para evitar errores de permisos con el usuario del contenedor)
mkdir -p ./data ./public/uploads
chmod -R 777 ./data ./public/uploads

# 3. Login en GitHub (Necesitas tu Token 'read:packages')
docker login ghcr.io -u mikiligero
# (Pega tu token cuando pida password)
```

## 2. LANZAMIENTO

1. Crea el archivo de configuración limpio:

```bash
cat <<EOF > docker-compose.yml
services:
  mikines-kitchen:
    image: ghcr.io/mikiligero/mikines-kitchen:latest
    container_name: mikines-kitchen
    restart: always
    ports:
      - "3000:3000"
    # SIN VOLUMENES: Todo es efímero (Cero problemas de permisos)
    environment:
      # Guardamos la DB en /tmp o /app/data interno
      - DATABASE_URL=file:/tmp/dev.db
EOF
```

2. Arranca la aplicación:

```bash
docker compose up -d
```

3. **IMPORTANTE**: Inicializa la base de datos (solo la primera vez o tras borrar contenedor):

```bash
docker compose exec mikines-kitchen npx prisma@5.22.0 migrate deploy
```

---

## ⚠️ GESTIÓN DE BACKUPS (CRÍTICO)

Como no usamos volúmenes, **si borras el contenedor pierdes los datos**.
Antes de actualizar la versión de la app, **TIENES** que sacar los datos fuera.


### 1. Script Automático (Recomendado)
He incluido scripts en la carpeta `backup/` para facilitar esto.

**Hacer Backup:**
```bash
./backup/backup.sh
```
*(Crea una carpeta en `backups/YYYYMMDD_HHMMSS` con la DB y las fotos)*

**Restaurar:**
```bash
./backup/restore.sh ./backups/20251215_203000
```
*(Restaura todo y ajusta permisos automáticamente)*

### 2. Método Manual
Si prefieres hacerlo a mano:

**Backup:**
```bash
docker cp mikines-kitchen:/tmp/dev.db ./backup_dev.db
docker cp mikines-kitchen:/app/public/uploads ./backup_uploads
```

**Restaurar:**
```bash
# Restaurar DB
docker cp ./backup_dev.db mikines-kitchen:/tmp/dev.db

# Restaurar Imágenes
docker cp ./backup_uploads/. mikines-kitchen:/app/public/uploads/

# Asegurar permisos tras restaurar
docker compose exec -u root mikines-kitchen chown -R 1001:1001 /tmp/dev.db /app/public/uploads
docker compose restart
```
