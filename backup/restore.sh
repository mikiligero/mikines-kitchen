#!/bin/bash
# mikines-restore.sh

if [ -z "$1" ]; then
    echo "❌ Error: Debes especificar la carpeta del backup a restaurar."
    echo "Uso: ./restore.sh ./backups/20251215_203000"
    exit 1
fi

BACKUP_DIR="$1"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: La carpeta '$BACKUP_DIR' no existe."
    exit 1
fi

echo "📦 Restaurando desde: $BACKUP_DIR"

# 1. Restaurar Base de Datos
if [ -f "$BACKUP_DIR/dev.db" ]; then
    echo "💾 Restaurando base de datos..."
    docker cp "$BACKUP_DIR/dev.db" mikines-kitchen:/tmp/dev.db
    echo "✅ Base de datos restaurada."
else
    echo "⚠️  No se encontró dev.db en el backup."
fi

# 2. Restaurar Uploads
if [ -d "$BACKUP_DIR/uploads" ]; then
    echo "🖼️  Restaurando imágenes..."
    # Primero creamos la carpeta por si no existe
    docker compose exec mikines-kitchen mkdir -p /app/public/uploads
    # Copiamos el CONTENIDO de uploads
    docker cp "$BACKUP_DIR/uploads/." mikines-kitchen:/app/public/uploads/
    echo "✅ Imágenes restauradas."
else
    echo "⚠️  No se encontró carpeta uploads/ en el backup."
fi

# 3. Ajustar Permisos (Importante)
echo "🔧 Ajustando permisos..."
docker compose exec -u root mikines-kitchen chown -R nextjs:nodejs /tmp/dev.db /app/public/uploads

echo "🚀 Reiniciando aplicación para aplicar cambios..."
docker compose restart

echo "---------------------------------------"
echo "✅ Restauración completada."
