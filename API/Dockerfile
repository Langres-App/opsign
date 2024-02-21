# Fetching the minified node image on apline linux
FROM node:21-alpine

# Setting up the work directory
WORKDIR /var/www

# Get Timezone data Package
RUN apk add --no-cache tzdata

# Set the timezone (2 ways)
ENV TZ=Europe/Paris
RUN ln -s /usr/share/zoneinfo/Europe/Paris /etc/localtime

# Exposing server port
EXPOSE 52200