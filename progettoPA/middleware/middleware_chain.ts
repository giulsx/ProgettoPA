import * as middlewareModel from './middlewareModel';
import * as middlewareAuth from './middlewareAuth';

/**
 * Catena di middleware
 */

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
    middlewareAuth.checkCredito,
    middlewareModel.checkSolve
];

export const updateEdges = [
    middlewareAuth.checkUser,
    middlewareModel.checkUpdateEdgeWeights
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