import * as middlewareModel from './middlewareModel';
import * as middlewareAuth from './middlewareAuth';

export const JWT = [
    middlewareAuth.checkHeader, 
    middlewareAuth.checkToken, 
    middlewareAuth.verifyAndAuthenticate
];

export const newModel = [
    middlewareAuth.checkUser,
    middlewareAuth.checkCredito,
    middlewareModel.checkNewModel
];

export const solveModel = [
    middlewareAuth.checkUser,
    middlewareModel.checkSolve
];

export const updateEdges = [
    middlewareAuth.checkUser,

];

export const admin = [
    middlewareAuth.checkAdmin,
    middlewareAuth.CheckReceiver

];

export const filterModels = [
    middlewareAuth.checkUser,
    middlewareModel.checkFilter
];

export const getSimulation = [
    middlewareAuth.checkUser,
    middlewareModel.checkDoSimulation
];