# Fetching the minified node image on apline linux
FROM httpd:alpine

# Setting up the work directory
WORKDIR /usr/local/apache2/htdocs/

# Get Timezone data Package
RUN apk add --no-cache tzdata

# Set the timezone (2 ways)
ENV TZ=Europe/Paris
RUN ln -s /usr/share/zoneinfo/Europe/Paris /etc/localtime

# Exposing server port
EXPOSE 80