# Utiliser l'image officielle Node pour le build
FROM node:20-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Construire le projet ReactJS pour production
RUN npm run build

# Utiliser Nginx pour servir le build
FROM nginx:stable-alpine

# Copier le build dans le dossier de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copier un fichier de configuration nginx si nécessaire
# COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
