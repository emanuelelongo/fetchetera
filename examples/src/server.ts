import express from 'express';

const app = express();

const printHeaders = (h: any) => Object.entries(h).map(([k, v]) => console.log(`${k}: ${v}`));

app.get('/test/:name', (req, res) => {
    console.log(`${req.method} ${req.path}`);
    printHeaders(req.headers);
    console.log('\n');
    const body = `Hello, ${req.params.name}.`;
    res.set('cache-control', 'max-age=3');
    res.send(body);
});

console.clear();
app.listen(3000);

