const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');

const {
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_STATUS,
    HTTP2_HEADER_CONTENT_TYPE,
    HTTP2_HEADER_CACHE_CONTROL,
} = http2.constants;

const server = http2.createSecureServer({
    cert: fs.readFileSync(path.join(__dirname, '/localhost.pem')),
    key: fs.readFileSync(path.join(__dirname, '/localhost-key.pem'))
});

function pushStatic(stream, path) {
    const file = utils.getFile(path);

    if (!file) {
        return;
    }

    stream.pushStream({ [HTTP2_HEADER_PATH]: path }, (error, pushStream) => {
        if (error) {
            throw error;
        }

        pushStream.respondWithFD(file.content, { ...file.headers });

        console.log(`Pushed static ${path}`);
    });
}

function pushFromAPI(stream, path) {
    stream.pushStream({ [HTTP2_HEADER_PATH]: path }, (error, pushStream) => {
        if (error) {
            throw error;
        }

        if (path === '/api/critical-data') {
            const file = utils.getFile('/assets/critical-data.json');

            if (!file) {
                pushStream.respond({ [HTTP2_HEADER_STATUS]: 200 }, {endStream: true});

                return;
            }

            pushStream.respondWithFD(file.content, { ...file.headers, [HTTP2_HEADER_CACHE_CONTROL]: 'no-cache' });
        } else {
            pushStream.respond({
                [HTTP2_HEADER_STATUS]: 200,
                [HTTP2_HEADER_CONTENT_TYPE]: 'application/json',
                [HTTP2_HEADER_CACHE_CONTROL]: 'no-cache'
            });
            pushStream.write(JSON.stringify(getLanguagesFromDB()));
            pushStream.end();
        }

        console.log(`Pushed ${path} as API endpoint response`);
    });
}

function getLanguagesFromDB() {
    return [{ "tag": "en-GB", "name": "English" }, { "tag": "nl-NL", "name": "Nederlands" }, { "tag": "es-ES", "name": "Español" }];
}

function respondWithPush(stream) {
    const assetPaths = [
        '/assets/bundle.js',
        '/assets/preset.css',
        '/assets/base.css'
    ];

    assetPaths.forEach(assetPath => pushStatic(stream, assetPath));

    pushFromAPI(stream, '/languages');
    pushFromAPI(stream, '/api/critical-data');
}

server.on('stream', (stream, headers) => {
    const path = headers[HTTP2_HEADER_PATH];

    console.log('Incoming request:', path);

    switch (path) {
        case '/':
            // Push all critical resources
            respondWithPush(stream);

            const {content, headers} = utils.getFile('/index.html');

            // Serve index.html
            stream.respondWithFD(content, headers);
            break;
        case '/favicon.ico':
            stream.respond({ [HTTP2_HEADER_STATUS]: 200 }, {endStream: true});
            break;
        default:
            stream.respond({ [HTTP2_HEADER_STATUS]: 404 }, {endStream: true});
    }
});

server.listen(3000);
