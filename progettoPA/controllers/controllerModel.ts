import * as user from "../model/modelUser";
import * as auth from "../middleware/middlewareAuth";
import * as model from "../model/model";

const Graph = require('node-dijkstra');
require('dotenv').config();


//creazione del modello

export class ModelController {
  public insertNewModel = async (req, res) => {
    try {
      let totalCost: number =
        auth.costoArchi(req.body.nodes) + auth.costoNodi(req.body.nodes); // calcoliamo il costo come somma dei costi dei vincoli e delle variabili
      var flag = await model.insertModel(req.body, totalCost);
      if (flag) {
        let oldBudget: any = await user.getBudget(req.user.email);
        let newBudget = oldBudget.budget - totalCost;
        await user.budgetUpdate(newBudget, req.user.email); // aggiorniamo il budget dell'utente, sottraendogli il costo del modello.
        res.sendStatus(201);
      } else {       
        res.sendStatus(400);
      }
    } catch {
      res.sendStatus(400);
    }
  };


  //eseguire il modello

  public solveModel = async (req, res) => {
    try {
      let modelSolve: any = await model.checkExistingModel(req.body.namemodel, req.body.version); // Ottieni il modello dal database

      let oldBudget : any = await user.getBudget(req.user.email)
      let newBudget= oldBudget.budget - modelSolve.cost;
      await user.budgetUpdate(newBudget, req.user.email);

      const startTime = performance.now(); // Calcola il tempo di inizio dell'esecuzione
      let result = executeModel(modelSolve.nodes, req.body.start, req.body.goal); // Esegui il modello specificando il nodo di partenza (start) e il nodo di arrivo (goal)
      const endTime = performance.now(); // Calcola il tempo di fine dell'esecuzione e determina la durata in millisecondi
      const executionTime = endTime - startTime;
      const pathCost = result.cost; // Aggiorna il costo del percorso con quello restituito dalla funzione `executeModel`
      let response = { // Crea l'oggetto JSON con il percorso, il costo del percorso e il tempo di esecuzione
        path: result.path,
        cost: pathCost,
        executionTime: executionTime
      };
      res.status(200).json(response);  // Restituisci il risultato come JSON
    } catch (e) {
      res.sendStatus(400);
    }
  };

  //aggiornamento del peso di uno o più archi
    
  public updateEdgeWeights = async (req, res) => {
    try {
      const graphName = req.body.namemodel; // nome del grafo
      const version = req.body.version;
      const edges = req.body.edges; // Array degli archi da aggiornare
  
      let graphP = await model.checkExistingModel(graphName, version); // Verifica che il grafo esista nel database
      if (!graphP) { // Verifica che il grafo esista
        res.status(404).json({ message: 'Grafo non trovato' });
        return;
      }
      for (const edge of edges) { // Itera sugli archi da aggiornare
        const node = edge.node;
        const neighbour = edge.neighbour;
        const newWeight = edge.newWeight;
        if (!graphP[node] || !graphP[node][neighbour]) { // Verifica che il nodo e il neighbour esistano nel grafo
          res.status(400).json({ message: 'Nodo o neighbour non trovato nel grafo' });
          return;
        }
        const previousWeight = graphP[node][neighbour];  // Ottieni il peso precedente dell'arco tra il nodo e il neighbour
  
        const alpha = parseFloat(process.env.ALPHA);
        const isValidAlpha = !isNaN(alpha) && alpha > 0 && alpha < 1;
        const fallbackAlpha = 0.9;
        const validAlpha = isValidAlpha ? alpha : fallbackAlpha;
        const weightedSum = validAlpha * previousWeight + (1 - validAlpha) * newWeight; // Calcola il nuovo peso utilizzando la formula della media esponenziale
  
        graphP[node][neighbour] = weightedSum;  // Aggiorna il peso dell'arco nel grafo
      }
      await model.insertUpdate(graphP, version + 1); // Salva il grafo aggiornato nel database
      res.status(200).json({ message: 'Pesi degli archi aggiornati con successo', graph: graphP }); // Restituisci la risposta con il grafo aggiornato
    } catch (error) {
      res.status(500).json({ message: 'Errore durante l\'aggiornamento dei pesi degli archi' });
    }
  };
  
  //Funzione che filtra in base alla data di modifica, numero di archi e numero di nodi
  public filterModel = async (req, res) => {
    try {
      let models: any = await model.getModel(req.body.name);
      let filteredModel = models
        .filter((item) => {
          if (req.body.date) {
            return req.body.date === item.creation_date; // confronto le stringhe relative alla data.
          } else {
            return true;
          }
        })
        .filter((item) => {
          if (req.body.numnodes) {
            return req.body.numnodes === item.nodes.length; // verifico che il numero dei nodi delle variabili sia quanto richiesto nel filtro.
          } else {
            return true;
          }
        })
        .filter((item) => {
          if (req.body.numedges) {
            return req.body.numedges === countEdges(item.nodes); // verifico che il numero delle variabili sia quanto richiesto nel filtro.
          } else {
            return true;
          }
        })
      res.send(filteredModel);
    } catch {
      res.sendStatus(400);
    }
  };

  // l'utente deve inserire il nome del modello, versione, l'arco che vuole cambiare definito dal nodo e il suo vicino, il nodo di partenza e di arrivo per testare 
  //il grafo, e i valori di start, stop e step per modificare il peso dell'arco 
public doSimulationModel = async (req, res) => {
  try {
    
    // Verifica che il grafo esista nel database
    let graph = await model.checkExistingModel(req.body.namemodel, req.body.version);

    const start = req.body.start; // Valore di inizio della simulazione
    const stop = req.body.stop; // Valore di fine della simulazione
    const step = req.body.step; // Passo di incremento

    // Verifica se i valori forniti sono ammissibili
    if (start >= stop || step <= 0) {
      res.status(400).json({ message: 'Valori non ammissibili per la simulazione' });
      return;
    }

    const node = req.body.node; // Nodo
    const neighbour = req.body.neighbour; // Vicino

    let bestResult = null; // Miglior risultato
    let bestConfig: { node: any; neighbour: any; weight: any; } | null = null;
  // Configurazione del peso migliore

  const simulationResults: { node: any; neighbour: any; weight: any; result: any; }[] = [];
  ; // Array dei risultati della simulazione

    // Itera attraverso i valori di peso desiderati
    for (let weight = start; weight <= stop; weight += step) {
      // Crea una copia del grafo per la simulazione
      const simulatedGraph = JSON.parse(JSON.stringify(graph));

      // Aggiorna il peso dell'arco nella copia del grafo con il valore corrente
      simulatedGraph.nodes[node][neighbour] = weight;

      // Esegui la soluzione del modello con il peso dell'arco aggiornato
      const result = await executeModel(simulatedGraph, req.body.startnode, req.body.endnode);

      // Confronta il risultato corrente con il miglior risultato registrato finora
      if (bestResult === null || result.cost > bestResult) {
        bestResult = result.cost;
        bestConfig = {
          node: node,
          neighbour: neighbour,
          weight: weight,
        };
      }

      // Aggiungi il risultato corrente all'array dei risultati della simulazione
      simulationResults.push({
        node: node,
        neighbour: neighbour,
        weight: weight,
        result: result.cost,
      });
    }

    // Restituisci l'array dei risultati della simulazione e il miglior risultato con la relativa configurazione di peso
    res.status(200).json({ simulationResults: simulationResults, bestResult: bestResult, bestConfig: bestConfig });
  } catch (error) {
    res.status(500).json({ message: 'Errore durante la simulazione dei pesi dell\'arco' });
  }
};

  /**
   * Ricarica nel db del credito dello user
   * @param req request
   * @param res response
   */
  public creditCharge = async (req, res) => {
    try {
      if (Number(req.user.budget) > 0) {
        let oldBudget: any = await user.getBudget(req.user.emailuser);
        let newBudget = oldBudget.budget + Number(req.user.budget);
        user.budgetUpdate(newBudget, req.user.emailuser); // aggiorniamo il budget dell'utente, sommando quanto dato dall'admin
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    } catch {
      res.sendStatus(400);
    }
  };

}
export default ModelController;


// Funzione per eseguire il modello e restituire il percorso ottimo con il costo associato
function executeModel(graph: any, start: any, goal: any) {
    const route = new Graph(graph);
    const options = {
      cost: true // Include il costo nel risultato
    };
    const result = route.path(start, goal, options); // Utilizza la funzione `path` per ottenere il percorso ottimo con il costo associato
    if (result.path === null) {
      throw new Error('Impossibile trovare un percorso tra il nodo di partenza e il nodo di arrivo.');
    }
    return { // Restituisci sia il percorso ottimo che il costo del percorso
      path: result.path,
      cost: result.cost
    }
  };

// Funzione ausiliaria per contare il numero di archi in un grafo
function countEdges(nodes) {
  let numEdges = 0;
  for (const node in nodes) {
    numEdges += Object.keys(nodes[node]).length;
  }
  return numEdges;
};