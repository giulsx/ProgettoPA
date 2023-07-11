import * as mNM from "../middleware/middlewareModel";
import * as auth from "../middleware/middlewareAuth";
import * as admin from "../middleware/middlewareAdmin";
import ModelController from "../controllers/controllerModel";

const express = require("express");
const router = express.Router();

let cntrModel = new ModelController();
router.use(express.json());

//middleware per verificare che le richieste siano un json
router.use((err, req, res, next) => {
  try {
    if (err instanceof SyntaxError && "body" in err) {
      throw "JSON not valid";
    }
    next();
  } catch (e){
    res.sendStatus(400);
  }
});

router.use([auth.checkHeader, auth.checkToken, auth.verifyAndAuthenticate]);

router.post(
  "/newModel",
  auth.checkUser,
  auth.checkCredito,
  mNM.newModelValidation,
  async (req, res) => {
    cntrModel.insertNewModel(req, res);
  }
);

router.post(
  "/solveModel",
  auth.checkUser,
  mNM.checkSolve,
  async (req, res) => {
    cntrModel.solveModel(req, res);
  }
);

router.get(
  "/updateEdges",
  auth.checkUser,
  mNM.newupdateEdgesValidation, //DA IMPLEMENTARE
  async (req, res) => {
    cntrModel.updateEdgeWeights(req, res);
  }
);

router.post(
  "/admin",
  admin.checkAdmin,
  admin.CheckReceiver,
  async (req, res) => {
    cntrModel.creditCharge(req, res);
  }
);

router.get(
  "/filterModels",
  auth.checkUser,
  mNM.checkFilter, 
  async (req, res) => {
    cntrModel.filterModel(req, res);
  }
);

router.get(
  "/getSimulation",
  auth.checkUser,
  mNM.checkDoSimulation, 
  async (req, res) => {
    cntrModel.doSimulationModel(req, res);
  }
);


router.get("*", async (req, res) => {
  res.sendStatus(404);
});

router.post("*", async (req, res) => {
  res.sendStatus(404);
});

module.exports = router;
