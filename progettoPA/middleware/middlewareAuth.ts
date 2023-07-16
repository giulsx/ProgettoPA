import * as jwt from "jsonwebtoken";
import * as User from "../model/modelUser";

export var checkHeader = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    next();
  } else {
    res.sendStatus(401);
  }
};

export function checkToken(req, res, next) {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(401);
  }
}

export function verifyAndAuthenticate(req, res, next) {
  try {
    let decoded = jwt.verify(req.token, process.env.SECRET_KEY);
    if (decoded !== null) {
      req.user = decoded;
      next();
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    res.sendStatus(401);
  }
}

export async function checkAdmin(req, res, next) {
  if (req.user.role === "2") {
    next();
  } else {
    res.sendStatus(401);
  }
}

export async function CheckReceiver(req, res, next) {
  const user: any = await User.checkExistingUser(req.user.emailuser);
  if (user.email === req.user.emailuser) {
    next();
  } else {
    res.sendStatus(404);
  }
}

export async function checkUser(req, res, next) {
  if (req.user.email && req.user.role === "1") {
    next();
  } else {
    res.sendStatus(401);
  }
}

export async function checkCredito(req, res, next) {
  try {
    let nodes = req.body;
    let totalCost: number = costoNodi(nodes) + costoArchi(nodes);
    const budget: any = await User.getBudget(req.user.email);
    if (budget.budget > totalCost) { // vediamo se c'è credito a sufficienza
      next();
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    res.sendStatus(401);
  }
}

//conto numero di nodi e numeri di archi
export const costNodes = (nodes) => {
  const numeroNodi = Object.keys(nodes).length;
  const costoNodi = numeroNodi * 0.15;
  return costoNodi;
};
  
//conto il costo addebitato agli archi come il numero di archi
export const costEdges = (nodes) => {
  let countArchi = 0;

  for (const node in nodes) {
    const neighbors = nodes[node];
    countArchi += Object.keys(neighbors).length;
  }

  const costoArchi = countArchi * 0.01;
  return costoArchi;
};
