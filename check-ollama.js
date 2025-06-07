const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 11434,
    path: '/api/tags',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('Ollama is running! Available models:');
            console.log(JSON.parse(data));
        } else {
            console.log('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('Error: Cannot connect to Ollama. Is it running?');
    console.error('Details:', error.message);
});

req.end();
