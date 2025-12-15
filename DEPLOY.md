# 🐳 Mikines Kitchen - Guía de Despliegue (LXC Stateless)

Esta guía asume que usas un contenedor **Proxmox LXC Privilegiado** con Docker instalado.
La aplicación se despliega en modo **Stateless** (sin volúmenes persistentes) para evitar problemas de permisos con ZFS. La persistencia de datos se gestiona mediante scripts automáticos de backup/restore.

## 📋 1. Requisitos Previos

1.  **LXC Container**: Debe ser **Unprivileged = No** (Privilegiado) y con **FUSE** activado en opciones.
2.  **Docker**: Instalado en el contenedor.
3.  **Git**: Para clonar este repositorio.

## 🚀 2. Instalación (Primera vez)

Sigue estos pasos si es la primera vez que arrancas la app:

1.  **Clonar repositorio y entrar:**
    ```bash
    git clone https://github.com/mikiligero/mikines-kitchen.git /opt/mikines-kitchen
    cd /opt/mikines-kitchen
    ```

2.  **Configurar entorno:**
    Crea el fichero `.env` (puedes copiar el de ejemplo si existe, o usar estos valores):
    ```bash
    nano .env
    ```
    *Contenido:*
    ```env
    DATABASE_URL=file:/tmp/dev.db
    JWT_SECRET=tu_secreto_super_seguro
    ```

3.  **Iniciar:**
    Usa el script de inicialización. Arrancará el contenedor y creará la base de datos.
    ```bash
    chmod +x init.sh update.sh backup/*.sh
    ./init.sh
    ```

4.  **Configurar Admin:**
    Entra en `http://TU_IP:3000`. Verás la pantalla de bienvenida para crear el primer usuario administrador.

---

## 🔄 3. Actualizar Versión (Mantenimiento)

Cuando haya una nueva versión de la app (imagen Docker), **NO** hagas `docker compose down/up` manualmente o perderás los datos. Usa siempre el script de actualización:

```bash
./update.sh
```

**¿Qué hace este script?**
1.  🛡️ **Backup**: Guarda tu BD y fotos en `./backups/FECHA`.
2.  📥 **Pull**: Descarga la última versión de la imagen.
3.  ♻️ **Restart**: Reinicia el contenedor (la BD se borra aquí).
4.  💾 **Restore**: Restaura tus datos automáticamente.
5.  🏗️ **Migrate**: Aplica cambios de esquema si los hay.

---

## 🛠️ Herramientas Manuales

Tienes scripts en la carpeta `backup/` para gestión manual si lo necesitas:

- **Hacer Backup:** `./backup/backup.sh`
- **Restaurar:** `./backup/restore.sh ./backups/CARPETA`

## ⚠️ Notas Importantes
- **Fotos**: Se guardan en memoria. Si reinicias sin usar `update.sh` o `backup.sh`, las perderás.
- **Base de Datos**: Igual que las fotos. Vive en `/tmp/dev.db`.
