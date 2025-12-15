#!/bin/bash
# init.sh - Inicializa la aplicación desde cero

echo "🚀 Iniciando Mikines Kitchen..."

# 1. Arrancar Contenedor
echo "📦 Levantando servicios..."
docker compose up -d

# 2. Esperar un poco a que arranque
echo "⏳ Esperando 5s a que el contenedor esté listo..."
sleep 5

# 3. Migrar Base de Datos
echo "🏗️  Aplicando migraciones de base de datos..."
if docker compose exec mikines-kitchen npx prisma@5.22.0 migrate deploy; then
    echo "✅ Base de datos inicializada."
else
    echo "❌ Error al migrar. Revisa los logs."
    exit 1
fi

# Intentar obtener la IP real (la primera que no sea local)
HOST_IP=$(hostname -I | awk '{print $1}')

echo "---------------------------------------"
echo "🎉 ¡Listo! Mikines Kitchen ya está cocinando."
echo "👉 Accede en: http://$HOST_IP:3000"
echo "ℹ️  Recuerda crear el usuario Admin en el primer login."
