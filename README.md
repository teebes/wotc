# wot

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

## Run with Docker
### Build the image
```
docker build -t wot .
```

### Run the container
```
docker run --rm -p 8080:80 --name wot wot
```

Then open [http://localhost:8080](http://localhost:8080).

### Stop the container
If running in the foreground, press `Ctrl+C`.

If running in detached mode (`-d`), stop it with:
```
docker stop wot
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
