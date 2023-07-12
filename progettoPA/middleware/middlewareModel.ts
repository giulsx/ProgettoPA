import * as model from "../model/model";

// esempio di richiesta di modello

/**
 * Middleware per validare la richiesta, con opportuni messaggi di errore
 * @param req request
 * @param res response
 * @param next
 */
export async function newModelValidation(req: any, res: any, next: any) {
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

/**
 * Funzione per validare la richiesta della creazione del nuovo modello
 * con opportuni controlli sui diversi campi
 * @param model modello della richiesta
 * @returns true o false se il modello è scritto correttamente
 */
const validationModel = (model: any): boolean => {
  if (
    (model.namemodel != undefined && model.namemodel && typeof model.namemodel === "string") &&
     validateNodes(model.nodes)
  ) {
    return true;
  } else {
    return false;
  }
};

//funzione ausiliare
function validateNodes(nodes) {
  if (!nodes || typeof nodes !== 'object') {
    return false; // Il campo "nodes" non è presente o non è un oggetto
  }
  for (const node in nodes) {
    if (typeof node !== 'string' || typeof nodes[node] !== 'object') {
      return false; // La chiave del nodo o il valore associato non sono nel formato corretto
    }
    for (const neighbour in nodes[node]) {
      if (typeof neighbour !== 'string' || typeof nodes[node][neighbour] !== 'number') {
        return false; // La chiave del vicino o il costo associato non sono nel formato corretto
      }
    }
  }
  return true; // Il campo "nodes" è nel formato corretto
}


/**
 * Funzione per validare la richiesta per la solve sia corretta, sia per i tipi sia per l'esistenza del modello nel db
 * @param req richiesta
 * @param res risposta
 * @param next
 */
export async function checkSolve(req: any, res: any, next: any) {
  if (
    req.body.namemodel &&
    typeof req.body.namemodel === "string" &&
    req.body.version &&
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
 * 
 * nome del modello, versione, l'arco che vuole cambiare definito dal nodo e il suo vicino, il nodo di partenza e di arrivo per testare 
  il grafo, e i valori di start, stop e step per modificare il peso dell'arco 

 * Verifica la validità della richiesta per la simulazione
 * @param req request
 * @param res response
 * @param next
 */
  export async function checkFilter(req: any, res: any, next: any){
    try {
      if (req.body.namemodel != undefined && typeof req.body.namemodel === "string") {
        if ( req.body.date == undefined || (req.body.date != undefined && typeof req.body.date === "string")) {
        } else {
          throw "Bad Request";
        }
        if (req.body.numnodes == undefined || (req.body.numnodes != undefined && typeof req.body.numnodes === "number")
        ) {
        } else {
          throw "Bad Request";
        }
        if (req.body.numedges == undefined || (req.body.numedges != undefined && typeof req.body.numedges === "number")
        ) {
        } else {
          throw "Bad Request";
        }
      } else {
        throw "Bad Request"
      }
      next();
    } catch {
      res.sendStatus(400);
    }
  };

/**
 * 
 * nome del modello, versione, l'arco che vuole cambiare definito dal nodo e il suo vicino, il nodo di partenza e di arrivo per testare 
  il grafo, e i valori di start, stop e step per modificare il peso dell'arco 

 * Verifica la validità della richiesta per la simulazione
 * @param req request
 * @param res response
 * @param next
 */
  export async function checkDoSimulation(req: any, res: any, next: any) {
    try {
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
        typeof req.body.step === "number"
      ) {
        next();
      } else {
        throw "Bad Request";
      }
    } catch (e) {
      res.sendStatus(400);
    }
  }
  

  /**
 * 
 * Verifica la validità della richiesta per l'aggionramento degli archi'
 * @param req request
 * @param res response
 * @param next
 */
  export async function checkUpdateEdgeWeights(req: any, res: any, next: any) {
    try {
      if (
        req.body.namemodel != undefined &&
        typeof req.body.namemodel === 'string' &&
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
        typeof edge.node === 'string' &&
        edge.neighbour != undefined &&
        typeof edge.neighbour === 'string' &&
        edge.newWeight != undefined &&
        typeof edge.newWeight === 'number' &&
        Number.isInteger(edge.newWeight) // Aggiunto controllo per l'intero
      ) {
        // Altri controlli specifici per l'arco se necessario
      } else {
        return false;
      }
    }
    return true;
  }
  









