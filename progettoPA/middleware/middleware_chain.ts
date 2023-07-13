import * as middlewareModel from './middlewareModel';
import * as middlewareAuth from './middlewareAuth';
import * as middlewareAdmin from './middlewareAdmin';

export const JWT = [
    middlewareAuth.checkHeader, 
    middlewareAuth.checkToken, 
    middlewareAuth.verifyAndAuthenticate
];

export const newModel = [
    middlewareAuth.checkUser,
    middlewareAuth.checkCredito,
    middlewareModel.newModelValidation
];

export const solveModel = [
    middlewareAuth.checkUser,
    middlewareModel.checkSolve
];

export const updateEdges = [
    middlewareAuth.checkUser,

];

export const admin = [
    middlewareAdmin.checkAdmin,
    middlewareAdmin.CheckReceiver

];

export const filterModels = [
    middlewareAuth.checkUser,
    middlewareModel.checkFilter
];

export const getSimulation = [
    middlewareAuth.checkUser,
    middlewareModel.checkDoSimulation
];