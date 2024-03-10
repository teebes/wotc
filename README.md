# The Wheel of Time MUD Web Client

## Docker

docker build -t wot .
docker -it --rm -p 3000:80
Then visit http://localhost:3000/ in a browser

## Manual Installation

Pre-reqs:

* Node v10.10.2+ / NPM v6.4.1+ https://nodejs.org/en/download/
* Bower v1.8.0+ https://bower.io/#install-bower
* Ruby v2.2+ / Gem v2.0+ http://www.ruby-lang.org/en/downloads/
* Compass v1.0+ http://compass-style.org/install/

```
bower install
compass compile
r.js -o build.js
```
