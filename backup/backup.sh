#!/bin/bash
# mikines-backup.sh

echo "📦 Iniciando copia de seguridad..."

# Crear carpeta de backups con fecha
DATE=${1:-$(date +%Y%m%d_%H%M%S)}
BACKUP_DIR="./backups/$DATE"
mkdir -p "$BACKUP_DIR"

# 1. Copiar Base de Datos
echo "💾 Copiando base de datos..."
if docker cp mikines-kitchen:/tmp/dev.db "$BACKUP_DIR/dev.db"; then
    echo "✅ Base de datos copiada."
else
    echo "⚠️  No se encontró la base de datos o el contenedor no corre."
fi

# 2. Copiar Uploads (Imágenes)
echo "🖼️  Copiando imágenes subidas..."
if docker cp mikines-kitchen:/app/public/uploads "$BACKUP_DIR/uploads"; then
    echo "✅ Imágenes copiadas."
else
    echo "⚠️  No se encontraron imágenes."
fi

echo "---------------------------------------"
echo "✅ Backup completado en: $BACKUP_DIR"
