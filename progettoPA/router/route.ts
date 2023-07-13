
import ModelController from "../controllers/controllerModel";
import * as middleware from "../middleware/middleware_chain";

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


router.post(
  "/newModel",
  middleware.JWT,
  middleware.newModel,
  async (req, res) => {
    cntrModel.insertNewModel(req, res);
  }
);

router.post(
  "/solveModel",
  middleware.JWT,
  middleware.solveModel,
  async (req, res) => {
    cntrModel.solveModel(req, res);
  }
);

router.post(
  "/updateEdges",
  middleware.JWT,
  middleware.updateEdges,
  async (req, res) => {
    cntrModel.updateEdgeWeights(req, res);
  }
);

router.post(
  "/admin",
  middleware.JWT,
  middleware.admin,
  async (req, res) => {
    cntrModel.creditCharge(req, res);
  }
);

router.get(
  "/filterModels",
  middleware.JWT,
  middleware.filterModels,
  async (req, res) => {
    cntrModel.filterModel(req, res);
  }
);

router.get(
  "/getSimulation",
  middleware.JWT,
  middleware.getSimulation, 
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
