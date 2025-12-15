# 🐳 Mikines Kitchen - Guía de Despliegue (LXC Stateless)

Esta guía asume que usas un contenedor **Proxmox LXC Privilegiado** con Docker instalado.

## 📋 1. Requisitos Previos

> [!IMPORTANT]
> **REQUISITO CRÍTICO:** El contenedor LXC **TIENE** que ser **PRIVILEGIADO** (`Unprivileged container: No`).
> Si usas un contenedor "Unprivileged" (por defecto en Proxmox), **Docker fallará** o tendrás problemas de permisos.
>
> *Opciones > Features > Nesting = ON* también es recomendable.

1.  **LXC Container**: Privilegiado (Unprivileged = No).
2.  **Docker**: Instalado en el contenedor.
La aplicación se despliega en modo **Stateless** (sin volúmenes persistentes) para evitar problemas de permisos con ZFS. La persistencia de datos se gestiona mediante scripts automáticos de backup/restore.

## ️ 0. Preparar el Sistema (LXC Nuevo)

Si tu contenedor está recién creado, ejecuta esto primero para tener todo listo:

```bash
# Actualizar sistema e instalar herramientas básicas
apt update && apt upgrade -y
apt install -y curl git

# Instalar Docker (Script oficial)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## 🚀 1. Instalación y Actualización (Método Automático)

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
