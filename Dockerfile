# Dockerfile multi-étapes pour optimiser la taille de l'image

# Étape 1: Build du frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de configuration
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copier le code source et builder
COPY frontend/ ./
RUN npm run build

# Étape 2: Setup du backend
FROM node:18-alpine AS backend-setup

WORKDIR /app/backend

# Installer les dépendances
COPY backend/package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY backend/ ./

# Étape 3: Image finale
FROM node:18-alpine AS production

# Installer les outils système nécessaires
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Copier les fichiers du backend
COPY --from=backend-setup --chown=nodeuser:nodejs /app/backend ./backend

# Copier les fichiers buildés du frontend
COPY --from=frontend-builder --chown=nodeuser:nodejs /app/frontend/build ./frontend/build

# Créer les dossiers nécessaires
RUN mkdir -p logs deployments && \
    chown -R nodeuser:nodejs logs deployments

# Passer à l'utilisateur non-root
USER nodeuser

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Commande de démarrage avec dumb-init pour gérer les signaux
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/src/server.js"]
