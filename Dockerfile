# Use a more recent Ubuntu LTS version
FROM ubuntu:22.04

# Set non-interactive mode for apt
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies and Node.js 18 (LTS)
RUN apt-get update && \
    apt-get install -y curl git build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install nginx
RUN apt-get install -y nginx

# Install modern build tools
RUN npm install -g sass requirejs@2.3.6

WORKDIR /code/wot

# Copy dependency files first
COPY bower.json package*.json ./

# Install dependencies using npm instead of bower - use available versions
RUN npm init -y && \
    npm install jquery@2.1.3 backbone@1.3.3 backbone.marionette@3.5.0 \
    requirejs@2.2.0 underscore@1.8.3 handlebars@4.7.8 \
    require-handlebars-plugin@0.11.2

COPY . /code/wot

# Create symlinks in bower_components to mimic bower structure for existing code
RUN mkdir -p bower_components && \
    ln -s ../node_modules/jquery bower_components/jquery && \
    ln -s ../node_modules/backbone bower_components/backbone && \
    ln -s ../node_modules/backbone.marionette bower_components/backbone.marionette && \
    ln -s ../node_modules/require-handlebars-plugin bower_components/require-handlebars-plugin && \
    ln -s ../node_modules/requirejs bower_components/requirejs && \
    ln -s ../node_modules/underscore bower_components/underscore

# Compile SCSS using modern sass instead of compass
RUN mkdir -p stylesheets && \
    sass scss/app.scss stylesheets/app.css

# Build with requirejs
RUN r.js -o build.js && cp index.html index-serve.html

# Configure nginx
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

# Update the HTML to use the built version
RUN sed -i 's/data-main="js\/wot"/data-main="js\/main-built"/' index-serve.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]