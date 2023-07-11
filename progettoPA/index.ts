import { SingletonDB } from "./model/database";
import * as express from 'express';
import * as mNM from './middleware/middlewareModel';
import { send } from "process";

var app = express();


const PORT = 8080;
const HOST = '0.0.0.0';

app.use('/', require("./router/router"));

app.listen(PORT, HOST);