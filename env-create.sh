#!/bin/bash

# Prompt for database details
read -p "Please enter your MySQL root password: " MYSQL_ROOT_PASSWORD
read -p "Please enter your MySQL username: " MYSQL_USER
read -p "Please enter your MySQL password: " MYSQL_PASSWORD
read -p "Please enter your database name: " MYSQL_DATABASE
while true; do
    read -p "Please enter your app context (prod or dev): " APP_CONTEXT
    if [ "${APP_CONTEXT}" == "prod" ] || [ "${APP_CONTEXT}" == "dev" ]; then
        # If the context is valid, break the loop and continue with the rest of your script
        break
    else
        echo "Invalid app context. Please enter either the word prod or dev."
    fi
done

read -p "What Timezone to use? (default Europe/Paris) " TIMEZONE
if [ -z "${TIMEZONE}" ]
  then
    TIMEZONE="'Europe/Paris'"
fi


while true; do
    read -p "Is there a proxy in your network ? (yes/no) " PROXY_ANSWER;
    if [ "${PROXY_ANSWER}" == "yes" ] || [ "${PROXY_ANSWER}" == "no" ]; then 
      break;
    else
        echo "Please answer yes or no";
    fi
done

if [ "${PROXY_ANSWER}" == "yes" ]
  then
    read -p "Please enter your proxy address(default will be 'http://10.0.0.1'): " PROXY_ADDRESS
      if [ -z "${PROXY_ADDRESS}" ]
        then
        PROXY_ADDRESS="http://10.0.0.1"
      fi
    read -p "Please enter your proxy port(default will be '80'): " PROXY_PORT
      if [ -z "${PROXY_PORT}" ]
        then
        PROXY_PORT="80"
      fi
    PROXY_ENV="      http_proxy: ${PROXY_ADDRESS}:${PROXY_PORT}"
    # PROXY_DOCKERFILE="ENV http_proxy=\'${PROXY_ADDRESS}:${PROXY_PORT}\'"
    # sed -i "3s|.*|$PROXY_DOCKERFILE|" docker/dockerfile/Dockerfile
fi

# Generate a new secret key
APP_SECRET=$(openssl rand -hex 16)

# Create docker-compose.override.yml file to use the good entrypoint
cat > docker-compose.override.yml <<EOL
version: '3.8'

services:
  webapi:
    image: ghcr.io/polangres/posignapi:main
    restart: unless-stopped 
    entrypoint: "./${APP_CONTEXT}-entrypoint.sh"
    ports:
      - "52200"
    environment:
      DB_HOST: database
      DB_USER: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      DB_DATABASE: ${MYSQL_DATABASE}
      PORT: 52200
${PROXY_ENV}
      APP_TIMEZONE: ${TIMEZONE}
    volumes:
      - ./Docs:/var/www/Docs
    labels:
      - traefik.enable=true
      - traefik.http.routers.webdap.rule=PathPrefix(\`/posignapi\`)
      - traefik.http.routers.webdap.middlewares=strip-webdap-prefix
      - traefik.http.middlewares.strip-webdap-prefix.stripprefix.prefixes=/posignapi
      - traefik.http.routers.webdap.entrypoints=web
    depends_on:
      - database
    networks:
      vpcbr:
        ipv4_address: 172.23.0.4

  web:
    image: ghcr.io/polangres/posignfront:main
    restart: unless-stopped
    depends_on:
      - webapi
    environment:
      HOSTNAME: ${HOSTNAME}
      PORT: 80
${PROXY_ENV}
      APP_TIMEZONE: ${TIMEZONE}
    labels:
      - traefik.enable=true
      - traefik.http.routers.webchart.rule=PathPrefix(\`/posign\`)
      - traefik.http.routers.webchart.middlewares=strip-webchart-prefix
      - traefik.http.middlewares.strip-webchart-prefix.stripprefix.prefixes=/posign
      - traefik.http.routers.webchart.entrypoints=web
    networks:
      vpcbr:
        ipv4_address: 172.23.0.5
networks:
  vpcbr:
    driver: bridge
    ipam:
      config:
        - subnet: 172.23.0.0/16
          gateway: 172.23.0.1
    
EOL


# Create .env file
cat > .env <<EOL
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=${MYSQL_DATABASE}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
HOSTNAME=${HOSTNAME}

###> symfony/framework-bundle ###
APP_ENV=${APP_CONTEXT}

EOL


echo ".env file created successfully!"

if [ "${APP_CONTEXT}" == "prod" ]
  then

APP_CONTEXT="dev"
sed -i "s|^APP_ENV=prod.*|APP_ENV=dev|" .env

# Create docker-compose.override.yml file to use the good entrypoint
cat > docker-compose.override.yml <<EOL
version: '3.8'

services:
  webapi:
    image: ghcr.io/polangres/posignapi:main
    restart: unless-stopped 
    entrypoint: "./${APP_CONTEXT}-entrypoint.sh"
    ports:
      - "52200"
    environment:
      DB_HOST: database
      DB_USER: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      DB_DATABASE: ${MYSQL_DATABASE}
      PORT: 52200
${PROXY_ENV}
      APP_TIMEZONE: ${TIMEZONE}
    volumes:
      - ./Docs:/var/www/Docs
    labels:
      - traefik.enable=true
      - traefik.http.routers.webdap.rule=PathPrefix(\`/posignapi\`)
      - traefik.http.routers.webdap.middlewares=strip-webdap-prefix
      - traefik.http.middlewares.strip-webdap-prefix.stripprefix.prefixes=/posignapi
      - traefik.http.routers.webdap.entrypoints=web
    depends_on:
      - database
    networks:
      vpcbr:
        ipv4_address: 172.23.0.4

  web:
    image: ghcr.io/polangres/posignfront:main
    restart: unless-stopped
    depends_on:
      - webapi
    environment:
      HOSTNAME: ${HOSTNAME}
      PORT: 80
${PROXY_ENV}
      APP_TIMEZONE: ${TIMEZONE}
    labels:
      - traefik.enable=true
      - traefik.http.routers.webchart.rule=PathPrefix(\`/posign\`)
      - traefik.http.routers.webchart.middlewares=strip-webchart-prefix
      - traefik.http.middlewares.strip-webchart-prefix.stripprefix.prefixes=/posign
      - traefik.http.routers.webchart.entrypoints=web
    networks:
      vpcbr:
        ipv4_address: 172.23.0.5
networks:
  vpcbr:
    driver: bridge
    ipam:
      config:
        - subnet: 172.23.0.0/16
          gateway: 172.23.0.1

EOL


sg docker -c "docker compose up --build -d"

sleep 90

sg docker -c "docker compose stop"

sleep 30

sed -i "s|^APP_ENV=dev.*|APP_ENV=prod|" .env
APP_CONTEXT="prod"


# Create docker-compose.override.yml file to use the good entrypoint
cat > docker-compose.override.yml <<EOL
version: '3.8'

services:
  webapi:
    image: ghcr.io/polangres/posignapi:main
    restart: unless-stopped 
    entrypoint: "./${APP_CONTEXT}-entrypoint.sh"
    ports:
      - "52200"
    environment:
      DB_HOST: database
      DB_USER: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      DB_DATABASE: ${MYSQL_DATABASE}
      PORT: 52200
${PROXY_ENV}
      APP_TIMEZONE: ${TIMEZONE}
    volumes:
      - ./Docs:/var/www/Docs
    labels:
      - traefik.enable=true
      - traefik.http.routers.webdap.rule=PathPrefix(\`/posignapi\`)
      - traefik.http.routers.webdap.middlewares=strip-webdap-prefix
      - traefik.http.middlewares.strip-webdap-prefix.stripprefix.prefixes=/posignapi
      - traefik.http.routers.webdap.entrypoints=web
    depends_on:
      - database
    networks:
      vpcbr:
        ipv4_address: 172.23.0.4

  web:
    image: ghcr.io/polangres/posignfront:main
    restart: unless-stopped
    depends_on:
      - webapi
    environment:
      HOSTNAME: ${HOSTNAME}
      PORT: 80
${PROXY_ENV}
      APP_TIMEZONE: ${TIMEZONE}
    labels:
      - traefik.enable=true
      - traefik.http.routers.webchart.rule=PathPrefix(\`/posign\`)
      - traefik.http.routers.webchart.middlewares=strip-webchart-prefix
      - traefik.http.middlewares.strip-webchart-prefix.stripprefix.prefixes=/posign
      - traefik.http.routers.webchart.entrypoints=web
    networks:
      vpcbr:
        ipv4_address: 172.23.0.5
networks:
  vpcbr:
    driver: bridge
    ipam:
      config:
        - subnet: 172.23.0.0/16
          gateway: 172.23.0.1
EOL

fi