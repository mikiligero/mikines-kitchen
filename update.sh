#!/bin/bash
# update.sh - Actualiza la app conservando datos

echo "🔄 Iniciando proceso de actualización..."

# Generamos ID único para este proceso
UPDATE_ID=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="./backups/$UPDATE_ID"

# 1. Backup Previo
echo "Step 1/5: 🛡️  Haciendo backup de seguridad..."
./backup/backup.sh "$UPDATE_ID"

# Verificamos que el backup existe antes de borrar nada
if [ ! -f "$BACKUP_PATH/dev.db" ]; then
    echo "❌ ERROR CRÍTICO: El backup falló. Cancelando actualización para proteger tus datos."
    exit 1
fi

# 2. Descargar nueva versión
echo "Step 2/5: 📥 Descargando nueva imagen..."
docker compose pull

# 3. Reiniciar Contenedor (Esto borra la DB actual)
echo "Step 3/5: ♻️  Reiniciando contenedor..."
docker compose up -d

echo "⏳ Esperando 5s para restaurar..."
sleep 5

# 4. Restaurar Datos
echo "Step 4/5: 💾 Restaurando datos..."
./backup/restore.sh "$BACKUP_PATH"

# 5. Aplicar nuevas migraciones (por si la nueva versión cambió el esquema)
echo "Step 5/5: 🏗️  Aplicando migraciones pendientes..."
docker compose exec mikines-kitchen npx prisma@5.22.0 migrate deploy

echo "---------------------------------------"
echo "✅ Actualización completada con éxito."
