#!/bin/bash

# Este script realiza o build da imagem Docker localmente.
# Dê permissão de execução com: chmod +x build-image.sh

IMAGE_NAME="integrador-api"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"

echo "==========================================="
echo "⚙️  Iniciando build da imagem: $FULL_IMAGE_NAME"
echo "==========================================="

docker build -t $FULL_IMAGE_NAME .

if [ $? -eq 0 ]; then
  echo "✅ Build concluído com sucesso!"
  echo ""
  echo "Próximos passos:"
  echo "1. Se estiver rodando o Portainer no mesmo nó local, você pode fazer o deploy direto pela interface usando o 'stack.yml'."
  echo "2. Se o Portainer estiver em outro servidor/cluster Swarm, você deve enviar a imagem para um registry (Docker Hub, AWS ECR, etc):"
  echo "   docker tag $FULL_IMAGE_NAME seu-registry/$FULL_IMAGE_NAME"
  echo "   docker push seu-registry/$FULL_IMAGE_NAME"
else
  echo "❌ Falha no build da imagem."
  exit 1
fi
