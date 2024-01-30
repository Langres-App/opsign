# Fetching the minified node image on apline linux
FROM httpd:alpine

RUN sed -i -e "s/\/usr\/local\/apache2\/htdocs/\/usr\/local\/apache2\/htdocs\/visual\/pages/g" /usr/local/apache2/conf/httpd.conf

# Setting up the work directory
WORKDIR /usr/local/apache2/htdocs/

# Exposing server port
EXPOSE 80