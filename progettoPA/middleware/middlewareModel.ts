import * as model from "../model/model";

/**
 * Validazione della richiesta di inserimento di un nuovo modello.
 * Vengono controllati: il nome del modello e l'inserimento corretto della struttura del grafo.
  * @param req 
 * @param res 
 * @param next 
 */

export async function checkNewModel(req: any, res: any, next: any) {
  try {
    let response = await validationModel(req.body); // qui vediamo l'esito della validazione del modello
    if (response) {     
      next();
    } else {
      res.sendStatus(400); //Bad Request
    }
  } catch (error) {
    res.sendStatus(403);
  }
}

const validationModel = (model: any): boolean => {
  if (
    (model.namemodel != undefined && 
     model.namemodel && typeof model.namemodel === "string") &&
     validationNodes(model.nodes)
  ) {
    return true;
  } else {
    return false;
  }
};

function validationNodes(nodes): boolean {
  if (!nodes || typeof nodes !== "object") {
    return false; 
  }
  for (const node in nodes) {
    if (typeof node !== "string" || typeof nodes[node] !== "object") {
      return false; 
    }
    for (const neighbour in nodes[node]) {
      if (typeof neighbour !== "string" || typeof nodes[node][neighbour] !== "number") {
        return false; 
      }
    }
  }
  return true; 
}


/**
 * Validazione della richiesta di eseguire il modello.
 * Vengono controllati: il nome del modello, la versione e l'esistenza di tale modello nel db.
 * @param req 
 * @param res 
 * @param next 
 */

export async function checkSolve(req: any, res: any, next: any) {
  if (
    req.body.namemodel != undefined &&
    typeof req.body.namemodel === "string" &&
    req.body.version != undefined &&
    Number.isInteger(req.body.version)
  ) {
    if (await model.checkExistingModel(req.body.namemodel, req.body.version)) {
      next();
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(400);
  }
}


/**
 * Validazione della richiesta di filtro.
 * Viene controllato l'inserimento del nome del modello.
 * Vengono controllati, se inseriti: la data, il numero di nodi e il numero di archi.
 * @param req 
 * @param res 
 * @param next
 */
  export async function checkFilter(req: any, res: any, next: any) {
    try {
      const isValid = validateFilterRequest(req.body);
      if (isValid) {
        next();
      } else {
        res.sendStatus(400);
      }
    } catch (error) {
      res.sendStatus(400);
    }
  }
  
  function validateFilterRequest(request: any): boolean {
    if (
      request.namemodel !== undefined &&
      typeof request.namemodel === "string" &&
      (request.date === undefined || typeof request.date === "string") &&
      (request.numnodes === undefined || typeof request.numnodes === "number") &&
      (request.numedges === undefined || typeof request.numedges === "number")
    ) {
      return true;
    }
    return false;
  }

  
 /**
 * Validazione della richiesta di simulazione.
 * Vengono controllati: il nome del modello, della versione, il nodo e il vicino dell'arco a cui si vuole cambiare il peso,
 * il valore di start, stop e step,
 * il nodo di inizio e fine del percorso.
 * Inoltre viene controllato se il modello esiste nel db.
 * @param req 
 * @param res 
 * @param next
 */
  export async function checkDoSimulation(req: any, res: any, next: any) {
    if (
          req.body.namemodel !== undefined &&
          typeof req.body.namemodel === "string" &&
          req.body.version !== undefined &&
          Number.isInteger(req.body.version) &&
          req.body.node !== undefined &&
          typeof req.body.node === "string" &&
          req.body.neighbour !== undefined &&
          typeof req.body.neighbour === "string" &&
          req.body.start !== undefined &&
          typeof req.body.start === "number" &&
          req.body.stop !== undefined &&
          typeof req.body.stop === "number" &&
          req.body.step !== undefined &&
          typeof req.body.step === "number" &&
          req.body.startnode !== undefined &&
          typeof req.body.startnode === "string" &&
          req.body.endnode !== undefined &&
          typeof req.body.endnode === "string" &&
          req.body.start <= req.body.stop &&
          req.body.step >= 0
    ) {
      if (await model.checkExistingModel(req.body.namemodel, req.body.version)) {
        next();
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(400);
    }
  }

  /**
   * Validazione della richiesta di aggiornamento del cambio di peso di uno o più archi.
   * Vengono controllati: nome del modello, numero di versione, che l'array non sia vuoto.
   * Viene controllato l'interno dell'array degli archi, ogni arco presenta due nodi e il peso da aggiornare.
    * @param req 
  * @param res 
  * @param next
  */
  export async function checkUpdateEdgeWeights(req: any, res: any, next: any) {
    try {
      if (
        req.body.namemodel != undefined &&
        typeof req.body.namemodel === "string" &&
        req.body.version != undefined &&
        Number.isInteger(req.body.version) &&
        req.body.edges != undefined &&
        Array.isArray(req.body.edges) &&
        req.body.edges.length > 0
      ) {
        const edges = req.body.edges;
        if (checkEdges(edges)) {
          next();
        } else {
          throw 'Bad Request';
        }
      } else {
        throw 'Bad Request';
      }
    } catch (e) {
      res.sendStatus(400);
    }
  }
  
  function checkEdges(edges: any[]): boolean {
    for (const edge of edges) {
      if (
        edge.node != undefined &&
        typeof edge.node === "string" &&
        edge.neighbour != undefined &&
        typeof edge.neighbour === "string" &&
        edge.newWeight != undefined &&
        typeof edge.newWeight === "number" &&
        Number.isInteger(edge.newWeight) 
      ) {
      } else {
        return false;
      }
    }
    return true;
  }
  









