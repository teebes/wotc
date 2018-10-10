// Build file for requirejs optimizer
({
    baseUrl: 'js',
    mainConfigFile: 'js/wot.js',
    name: 'wot',
    optimize: "uglify2",
    findNestedDependencies: "true",
    out: 'js/main-built.js'
})
