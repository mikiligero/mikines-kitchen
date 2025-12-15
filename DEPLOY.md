# 🐳 Mikines Kitchen - Guía de Despliegue (LXC Stateless)

Esta guía asume que usas un contenedor **Proxmox LXC Privilegiado** con Docker instalado.
La aplicación se despliega en modo **Stateless** (sin volúmenes persistentes) para evitar problemas de permisos con ZFS. La persistencia de datos se gestiona mediante scripts automáticos de backup/restore.

## 📋 1. Requisitos Previos

1.  **LXC Container**: Debe ser **Unprivileged = No** (Privilegiado) y con **FUSE** activado en opciones.
2.  **Docker**: Instalado en el contenedor.
3.  **Git**: Para clonar este repositorio.

## 🚀 2. Instalación y Actualización (Método Automático)

Puedes instalar o actualizar la aplicación con **un solo comando** (estilo Proxmox Scripts).
Copia y pega esto en la consola de tu contenedor LXC:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/mikiligero/mikines-kitchen/main/install.sh)"
```

**Este comando mágico hace todo:**
- Si **NO** tienes la app: La descarga, configura el `.env` automáticamente y la arranca.
- Si **YA** tienes la app: Hace backup, descarga la nueva versión y actualiza sin perder datos.

---

### ¿Qué hace por debajo?
Básicamente automatiza lo que antes hacíamos a mano:
1.  Clona/Actualiza el repo en `/opt/mikines-kitchen`.
2.  Genera secretos si hace falta.
3.  Ejecuta `./init.sh` (instalación) o `./update.sh` (actualización).

¡Más fácil imposible! ⚡

---

## 🛠️ Herramientas Manuales

Tienes scripts en la carpeta `backup/` para gestión manual si lo necesitas:

- **Hacer Backup:** `./backup/backup.sh`
- **Restaurar:** `./backup/restore.sh ./backups/CARPETA`

## ⚠️ Notas Importantes
- **Fotos**: Se guardan en memoria. Si reinicias sin usar `update.sh` o `backup.sh`, las perderás.
- **Base de Datos**: Igual que las fotos. Vive en `/tmp/dev.db`.
