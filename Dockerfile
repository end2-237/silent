# Le site est déjà compilé dans cette branche : il n'y a rien à construire.
# On le pose simplement dans un nginx de 5 Mo.
FROM nginx:1.27-alpine-slim

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

EXPOSE 80
