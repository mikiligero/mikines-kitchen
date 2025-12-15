#!/bin/bash
# Mikines Kitchen Auto-Installer
# Uso: bash -c "$(curl -fsSL https://raw.githubusercontent.com/mikiligero/mikines-kitchen/main/install.sh)"

set -e

REPO_URL="https://github.com/mikiligero/mikines-kitchen.git"
INSTALL_DIR="/opt/mikines-kitchen"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   🧑‍🍳 Mikines Kitchen Installer      ${NC}"
echo -e "${BLUE}=======================================${NC}"

# 1. Comprobaciones Previas
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}⚠️  Por favor, ejecuta como root (o con sudo).${NC}"
  # Intentar re-ejecutar con sudo si no somos root
  if command -v sudo &> /dev/null; then
      echo "Re-lanzando con sudo..."
      curl -fsSL https://raw.githubusercontent.com/mikiligero/mikines-kitchen/main/install.sh | sudo bash
      exit 0
  else
      exit 1
  fi
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}❌ Docker no encontrado.${NC}"
    echo "Por favor, instálalo en tu contenedor LXC antes de continuar."
    exit 1
fi

# 2. Lógica de Instalación vs Actualización
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${GREEN}✅ Detectada instalación existente en $INSTALL_DIR${NC}"
    echo -e "${BLUE}🔄 Iniciando proceso de actualización...${NC}"
    
    cd "$INSTALL_DIR"
    
    # Auto-repair & Enforce State logic
    # 1. Asegurar que es un repo git
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}⚠️  Reparando repositorio Git...${NC}"
        git init
        git remote add origin "$REPO_URL"
    fi

    # 2. Asegurar que tenemos la última info
    echo "⬇️  Actualizando código..."
    git fetch origin --tags --force

    # 3. Forzar estar en main y coincidir con el remoto
    # Esto arregla si estabas en 'master', 'detached head', o si 'pull' fallaba
    git checkout -B main origin/main
    git reset --hard origin/main
    
    # Aseguramos permisos de ejecución
    chmod +x init.sh update.sh backup/*.sh
    
    # Delegamos en el script de actualización robusto
    ./update.sh

else
    echo -e "${GREEN}✨ Instalando desde cero...${NC}"
    
    # Instalar Git si falta
    if ! command -v git &> /dev/null; then
        echo "📦 Instalando git..."
        apt-get update && apt-get install -y git || apk add git
    fi
    
    # Clonar
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Configuración Automática de .env
    if [ ! -f .env ]; then
        echo -e "${BLUE}⚙️  Generando configuración (.env)...${NC}"
        
        # Generar secreto aleatorio
        if command -v openssl &> /dev/null; then
            JWT_SECRET=$(openssl rand -hex 32)
        else
            JWT_SECRET="secret_$(date +%s)"
        fi
        
        cat <<EOF > .env
DATABASE_URL=file:/tmp/dev.db
JWT_SECRET=$JWT_SECRET
EOF
        echo "✅ .env creado con secreto único."
    fi
    
    # Permisos
    chmod +x init.sh update.sh backup/*.sh
    
    # Inicializar
    ./init.sh
fi
