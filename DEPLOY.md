# Guía de Despliegue en Proxmox

## 1. Subir a GitHub
1. Crea un **nuevo repositorio** en [GitHub](https://github.com/new).
2. Sigue las instrucciones para subir tu código existente:
   ```bash
   git remote add origin https://github.com/mikiligero/mikines-kitchen.git
   git branch -M main
   git push -u origin main
   ```
3. Una vez subido, ve a la pestaña **Actions** en tu repositorio de GitHub. Deberías ver el workflow "Docker" ejecutándose. Cuando termine (verde), tu imagen estará lista en el registro.

## 2. Preparar Proxmox (LXC)
1. En Proxmox, crea un nuevo contenedor CT (LXC).
   - Base Template: Ubuntu o Debian.
   - Asegúrate de marcar **"Nesting"** en las opciones (Options > Features > nesting=1) para que Docker funcione bien.
2. Inicia el contenedor y entra en la consola.
3. Instala Docker y Docker Compose:
   ```bash
   # Actualizar
   apt update && apt upgrade -y
   # Instalar Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

## 3. Desplegar la Aplicación
1. En el contenedor, crea una carpeta para tu app:
   ```bash
   mkdir -p /opt/mikines-kitchen/data
   mkdir -p /opt/mikines-kitchen/public/uploads
   # Ajustar permisos para que el usuario 'nextjs' (UID 1001) del contenedor pueda escribir
   chown -R 1001:1001 /opt/mikines-kitchen/data
   chown -R 1001:1001 /opt/mikines-kitchen/public/uploads
   cd /opt/mikines-kitchen
   ```
2. Crea el archivo `docker-compose.yml` (puedes copiar el contenido de `docker-compose.prod.yml` que he creado en tu proyecto):
   ```bash
   nano docker-compose.yml
   # Pega el contenido. Ya está configurado con la imagen ghcr.io/mikiligero/mikines-kitchen:latest
   ```
3. Autentícate en el registro de GitHub (necesitarás un Personal Access Token si el paquete es privado, o usa tu password si es público/legacy, pero mejor Token):
   ```bash
   docker login ghcr.io -u mikiligero
   # Pega tu token/password
   ```
4. Arranca el servicio:
   ```bash
   docker compose up -d
   ```

¡Listo! Tu aplicación debería estar corriendo en `http://<IP-DEL-LXC>:3000`.
