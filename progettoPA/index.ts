import * as express from 'express';

var app = express();


const PORT = 8080;
const HOST = '0.0.0.0';

app.use('/', require("./router/route"));

app.listen(PORT, HOST);