define({
    wotWsServer: 'ws://localhost:9999/cmd',
    // realmsAPI: 'http://localhost:8000',
    // wotWsServer: 'wss://wot.writtenrealms.com/socket',

    // Dynamic API configuration function:
    // - localhost: use local nginx proxy (localhost:8080/api/) to avoid CORS
    // - production: use direct API calls to api.writtenrealms.com
    get realmsAPI() {
        return window.location.hostname === 'localhost' ?
            window.location.origin :
            'https://api.writtenrealms.com';
    },
});
