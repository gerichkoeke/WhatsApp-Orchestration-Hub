# WhatsApp Orchestration Hub

Hub intermediário entre Chatwoot, Meta API, n8n e Softdesk.
Este serviço atua como camada de orquestração para enviar mensagens da aplicação Chatwoot para o Meta WhatsApp Cloud API Oficial, suportando o incremento de assinatura de agente em respostas humanas.

## Requisitos

- Docker e Docker Compose / Docker Swarm (Portainer)
- Node.js 22 (para desenvolvimento local)
- PostgreSQL
- Chatwoot account/config configurada
- Meta / Facebook App com WhatsApp Produto configurado

## Instalação e Deploy

### Opção 1: Docker Compose Local

1. Renomeie o arquivo `.env.example` para `.env` e preencha com suas variáveis.
2. Inicie a stack com o Docker Compose (que inclui o PostgreSQL):
   ```bash
   docker-compose up -d
   ```
3. Rode as migrações do banco de dados (se necessário, de dentro do container ou conectando a partir da sua máquina):
   ```bash
   npm run db:push
   ```

### Opção 2: Portainer e Docker Swarm

1. Faça o build da imagem localmente executando o script de compilação:
   ```bash
   chmod +x build-image.sh
   ./build-image.sh
   ```
2. No Portainer, vá na aba **Stacks** e adicione uma nova Stack.
3. Arraste e solte o arquivo `stack.yml` (ou copie seu conteúdo).
4. Em _Environment variables_, você pode preencher as variáveis usando o padrão do seu `.env.example`.
5. Faça o deploy da stack.
*(Nota: O banco de dados está fixo no manager (`node.role == manager`) via constraint para evitar perda de dados por troca de nó, devido ao volume local).*

A API estará disponível na porta `3000`.

## Endpoints

- `GET /health` - Verificação de saúde.
- `GET /webhooks/meta` - Endpoint para configuração do webhook na interface do Facebook Developers.
- `POST /webhooks/meta` - Endpoint de recebimento de mensagens originais do WhatsApp (enviadas para o Chatwoot).
- `POST /webhooks/chatwoot` - Endpoint configurado no painel do Chatwoot (para disparar quando mensagens `message_created` "outgoing" ocorrerem).
- `POST /send/text` - Envio direto de texto via CLI/n8n.
- `POST /send/list` - Envio direto de menu em lista.
- `POST /conversation/assign` - Atribui conversa na conta do Chatwoot.
- `POST /conversation/close` - Resolve conversa na conta do Chatwoot.
