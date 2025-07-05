# Use Ubuntu 18.04 base image
FROM ubuntu:18.04

# Install dependencies, Node.js, and npm
RUN apt-get update && \
    apt-get install -y curl git && \
    curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs ruby-full build-essential libsass-dev

# Install Bower, Compass, and requirejs (r.js)
RUN npm install -g bower@1.8.0 && \
    gem install compass && \
    npm install -g requirejs@2.3.6

# Install nginx
RUN apt-get install -y nginx

WORKDIR /code/wot

COPY . /code/wot

RUN bower install --allow-root
RUN compass compile
RUN r.js -o build.js && cp index.html index-serve.html

RUN echo 'server {\
    listen       80;\
    server_name  localhost;\
    \
    location / {\
        default_type "text/html";\
        root /code/wot;\
        index index-serve.html;\
    }\
}' > /etc/nginx/conf.d/default.conf

RUN sed -i 's/data-main="js\/wot"/data-main="js\/main-built"/' index-serve.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# CMD ["/bin/sh", "-c", "while true; do sleep 30; done"]