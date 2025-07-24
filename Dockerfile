# Use specific Ubuntu LTS version - Ubuntu 22.04 supported until April 2027
FROM ubuntu:22.04@sha256:3c61d3759c2639d4b836d32a2d3c83fa0214e36f195a3421018dbaaf79cbe37f

# Set non-interactive mode for apt
ENV DEBIAN_FRONTEND=noninteractive

# Pin Node.js version for reproducibility
ENV NODE_VERSION=18.20.4
ENV NPM_VERSION=10.8.2

# Install system dependencies with version ranges for security updates
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        git \
        build-essential \
        ca-certificates \
        nginx && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js from official binaries (more reliable than NodeSource)
RUN curl -fsSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz \
    | tar -xJ -C /usr/local --strip-components=1 && \
    npm install -g npm@${NPM_VERSION}

# Install build tools with pinned versions
RUN npm install -g sass@1.77.8 requirejs@2.3.6

WORKDIR /code/wot

# Copy package files for better Docker layer caching
COPY bower.json package*.json ./

# Create package.json with exact versions for reproducible builds
RUN npm init -y && \
    npm install --save-exact \
        jquery@2.1.3 \
        backbone@1.3.3 \
        backbone.marionette@3.5.0 \
        requirejs@2.2.0 \
        underscore@1.8.3 \
        handlebars@4.7.8 \
        require-handlebars-plugin@0.11.2 && \
    npm shrinkwrap

# Copy application files
COPY . /code/wot

# Create symlinks for bower compatibility
RUN mkdir -p bower_components && \
    ln -sf ../node_modules/jquery bower_components/jquery && \
    ln -sf ../node_modules/backbone bower_components/backbone && \
    ln -sf ../node_modules/backbone.marionette bower_components/backbone.marionette && \
    ln -sf ../node_modules/require-handlebars-plugin bower_components/require-handlebars-plugin && \
    ln -sf ../node_modules/requirejs bower_components/requirejs && \
    ln -sf ../node_modules/underscore bower_components/underscore

# Build application
RUN mkdir -p stylesheets && \
    sass scss/app.scss stylesheets/app.css && \
    r.js -o build.js && \
    cp index.html index-serve.html && \
    sed -i 's/data-main="js\/wot"/data-main="js\/main-built"/' index-serve.html

# Configure nginx - create different configs for dev vs production
# Development config (default)
RUN echo 'server {\
    listen 80;\
    server_name localhost;\
    \
    # Security headers\
    add_header X-Frame-Options "SAMEORIGIN" always;\
    add_header X-Content-Type-Options "nosniff" always;\
    add_header X-XSS-Protection "1; mode=block" always;\
    \
    # API proxy to handle CORS for local development\
    location /api/ {\
        proxy_pass https://api.writtenrealms.com/api/;\
        proxy_ssl_server_name on;\
        proxy_set_header Host api.writtenrealms.com;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        \
        # Add CORS headers\
        add_header Access-Control-Allow-Origin "*" always;\
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;\
        add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization" always;\
        \
        # Handle preflight requests\
        if ($request_method = OPTIONS) {\
            add_header Access-Control-Allow-Origin "*";\
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";\
            add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization";\
            add_header Content-Length 0;\
            add_header Content-Type text/plain;\
            return 204;\
        }\
    }\
    \
    location / {\
        root /code/wot;\
        index index-serve.html;\
        try_files $uri $uri/ =404;\
    }\
    \
    # Cache static assets\
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\
        root /code/wot;\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
}' > /etc/nginx/conf.d/default.conf && \
    \
    # Production config (for when deployed at wot.writtenrealms.com)\
    echo 'server {\
        listen 80;\
        server_name wot.writtenrealms.com;\
        \
        # Security headers\
        add_header X-Frame-Options "SAMEORIGIN" always;\
        add_header X-Content-Type-Options "nosniff" always;\
        add_header X-XSS-Protection "1; mode=block" always;\
        \
        location / {\
            root /code/wot;\
            index index-serve.html;\
            try_files $uri $uri/ =404;\
        }\
        \
        # Cache static assets\
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\
            root /code/wot;\
            expires 1y;\
            add_header Cache-Control "public, immutable";\
        }\
    }' > /etc/nginx/conf.d/production.conf && \
    rm /etc/nginx/sites-enabled/default

# Set proper permissions for application files
RUN chmod -R 755 /code/wot

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]