/**
 * Primary file for the API
 * 
 */

// Dependecies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// The server should response to all requests with a string
const server = http.createServer((req, res) => {
    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload, if any
    let buffer = '';
    const decoder = new StringDecoder('utf-8');
    
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the notFound handler
		const chosenHandler = trimmedPath in router ? router[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		const data = {
			trimmedPath,
			queryStringObject,
			method,
			headers,
			payload: buffer
		};

		// Route the request to the handler specified in the router
		chosenHandler(data, (statusCode, payload) => {

			// use the status code called back by the handler, or default to 200
			statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

			// use the payload called back by the handler, or default to an empty object
			payload = typeof(payload) === 'object' ? payload : {};

			// Convert the payload to a string
			const payloadString = JSON.stringify(payload);

			// Return the response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			console.log(`Returning this response: ${statusCode}, ${payloadString}`);

		});

         // Send the response
        res.end('Hello World\n');

        // Log the request path
        console.log(`Request received payload ${buffer}`);

    });

});

// Start the server, and have it listen on port 3000
server.listen(3000, () => {
    console.log('The server is listening on port 3000 now');
});


// Define the handlers
const handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
    callback(406, { 'name': 'Sampler handler' });
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// Hello handler
handlers.hello = (data, callback) => {
    callback(200, { 'message': 'Hello people, wasa' });
};

// Define the request router
const router = {
    'sample': handlers.sample,
    'hello': handlers.hello,
    'notFound': handlers.notFound
};