const http = require('http');

let requestCount = 0;

const server = http.createServer((req, res) => {
    requestCount++;
    console.log(`[TARGET SERVER] Received request #${requestCount}`);

    // THE TIME BOMB BUG: 
    if (requestCount === 3) {
        console.log("[TARGET SERVER] Uh oh... simulating a critical failure...");
        triggerFatalError(); // This function does not exist!
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is running normally.\n');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`[TARGET SERVER] Online and listening on Port ${PORT}...`);
});