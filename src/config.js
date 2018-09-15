export default {
    wsServer: 'ws://localhost:9999/cmd',
    emulate: {
        charname: 'a',
        password: 'b',
    },
    //emulate: false,
    COLORS: {
        '\x1b[31m': 'red',
        '\x1b[36m': 'blue',
        '\x1b[32m': 'green',
        '\x1b[33m': 'yellow',
        '\x1b[0m': 'normal',
    },
    COLOR_LIST: [
        '\x1b[31m',
        '\x1b[36m',
        '\x1b[32m',
        '\x1b[33m',
        '\x1b[0m',
    ],
    END_COLOR: '\x1b[0m'
}