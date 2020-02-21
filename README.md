# A simple demonstration of HTTP/2 Server Push feature with Node.js
Pushes CSS, JS, JSON alongside index.html

## Prerequisites
- Node.js >= v12.16.0
- https://github.com/FiloSottile/mkcert for managing SSL certs locally

## Usage
```
brew install mkcert
mkcert -install
```

In project root run:
```
mkcert localhost
npm i
npm start
open https://localhost:3000
observe HTTP requests in Network tab of dev tools and console logs from the server in the terminal
```
