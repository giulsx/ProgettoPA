import * as user from "../model/modelUser";
import * as auth from "../middleware/middlewareAuth";
import * as model from "../model/model";

const Graph = require('node-dijkstra');
require('dotenv').config();


export class ModelController {

  /**
  * Inserimento di un nuovo modello. 
  * L'inserimento prevede un costo (basato sul numero di nodi e numero di archi)che l'utente dovrà pagare.
  */

  public insertNewModel = async (req, res) => {
    try {
      let totalCost: number =
        auth.costoArchi(req.body.nodes) + auth.costoNodi(req.body.nodes); // calcolo del costo totale in base al numero di archi e numero di nodi
      var flag = await model.insertModel(req.body, totalCost);
      if (flag) {
        let oldBudget: any = await user.getBudget(req.user.email);
        let newBudget = oldBudget.budget - totalCost; //calcolo del nuovo bugdet dell'utente
        await user.budgetUpdate(newBudget, req.user.email); // aggiorna del bugdet dell'utente
        res.sendStatus(201);
      } else {       
        res.sendStatus(400);
      }
    } catch {
      res.sendStatus(400);
    }
  };


  /**
  * Esecuzione di un dato modello, specificando il nodo di inizo e fine percorso. 
  * Il risultato ottenuto sarà un JSON contenente il percorso, il costo del percorso e il tempo di esecuzione
  */

  public solveModel = async (req, res) => {
    try {
      let modelSolve: any = await model.checkExistingModel(req.body.namemodel, req.body.version); // Ottieni il modello dal database

      let oldBudget : any = await user.getBudget(req.user.email)
      let newBudget= oldBudget.budget - modelSolve.cost;
      await user.budgetUpdate(newBudget, req.user.email);

      const startTime = performance.now(); // calcola il tempo di inizio dell'esecuzione
      let result = executeModel(modelSolve.nodes, req.body.start, req.body.goal); // esegui il modello specificando il nodo di partenza (start) e il nodo di arrivo (goal)
      const endTime = performance.now(); // calcola il tempo di fine dell'esecuzione e determina la durata in millisecondi
      const executionTime = endTime - startTime;
      const pathCost = result.cost; // aggiorna il costo del percorso con quello restituito dalla funzione `executeModel`
      let response = { // crea l'oggetto JSON con il percorso, il costo del percorso e il tempo di esecuzione
        path: result.path,
        cost: pathCost,
        executionTime: executionTime
      };
      res.status(200).json(response);  // restituisci il risultato come JSON
    } catch (e) {
      res.sendStatus(400);
    }
  };
    

  /**
  * Aggiornamento del costo di uno o più archi di un dato modello.
  */

  public updateEdgeWeights = async (req, res) => {
    try {
      const name = req.body.namemodel; 
      const version = req.body.version;
      const edges = req.body.edges; // array degli archi da aggiornare, contenente i due nodi e il peso da aggiornare
  
      let graphP = await model.checkExistingModel(name, version); // verifica che il grafo esista nel database
      if (!graphP) { // verifica che il grafo esista
        res.status(404).json({ message: 'Grafo non trovato' });
        return;
      }
      for (const edge of edges) { // itera sugli archi da aggiornare
        const node = edge.node;
        const neighbour = edge.neighbour;
        const newWeight = edge.newWeight;
        if (!graphP[node] || !graphP[node][neighbour]) { // verifica che il nodo e il neighbour esistano nel grafo
          res.status(400).json({ message: 'Nodo o neighbour non trovato nel grafo' });
          return;
        }
        const previousWeight = graphP[node][neighbour];  // ottieni il peso precedente dell'arco tra il nodo e il neighbour
  
        const alpha = parseFloat(process.env.ALPHA);
        const isValidAlpha = !isNaN(alpha) && alpha > 0 && alpha < 1;
        const fallbackAlpha = 0.9;
        const validAlpha = isValidAlpha ? alpha : fallbackAlpha;
        const weightedSum = validAlpha * previousWeight + (1 - validAlpha) * newWeight; // calcola il nuovo peso utilizzando la formula della media esponenziale
  
        graphP[node][neighbour] = weightedSum;  // aggiorna il peso dell'arco nel grafo
      }
      await model.insertUpdate(graphP, version + 1); // salva il grafo aggiornato nel database
      res.status(200).json({ message: 'Pesi degli archi aggiornati con successo', graph: graphP }); // restituisci la risposta con il grafo aggiornato
    } catch (error) {
      res.status(500).json({ message: 'Errore durante l\'aggiornamento dei pesi degli archi' });
    }
  };
  

  /**
  * Filtraggio delle versioni di un modello in base alla data, al numero di nodi e al numero di archi.
  */

  public filterModel = async (req, res) => {
    try {
      let models: any = await model.getModel(req.body.namemodel);
      let filteredModel = models
        .filter((item) => {
          if (req.body.date) {
            return req.body.date === item.creation_date; // confronto le stringhe relative alla data
          } else {
            return true;
          }
        })
        .filter((item) => {
          if (req.body.numnodes) {
            return req.body.numnodes === item.nodes.length; // verifica che il numero dei nodi delle variabili sia quanto richiesto nel filtro
          } else {
            return true;
          }
        })
        .filter((item) => {
          if (req.body.numedges) {
            return req.body.numedges === countEdges(item.nodes); // verifica che il numero delle variabili sia quanto richiesto nel filtro
          } else {
            return true;
          }
        })
      res.send(filteredModel);
    } catch {
      res.sendStatus(400);
    }
  };


  /**
  * Simulazione di un modello che consente di variare il peso relativo ad un arco dichiarando valore di inzio, fine e passo.
  * Affinché possa avvenire la simulazione è previsto l'inserimento del nome del modello, della versione, del nodo di inizio e di fine.
  */
  public doSimulationModel = async (req, res) => {
    try {
      
      // Verifica che il grafo esista nel database
      let graph = await model.checkExistingModel(req.body.namemodel, req.body.version);

      const start = req.body.start; // valore di inizio della simulazione
      const stop = req.body.stop; // valore di fine della simulazione
      const step = req.body.step; // passo di incremento

      // verifica se i valori forniti sono ammissibili
      if (start >= stop || step <= 0) {
        res.status(400).json({ message: 'Valori non ammissibili per la simulazione' });
        return;
      }

      const node = req.body.node; // nodo
      const neighbour = req.body.neighbour; // vicino

      let bestResult = null; // miglior risultato
      let bestConfig: { node: any; neighbour: any; weight: any; } | null = null;
    // configurazione del peso migliore

    const simulationResults: { node: any; neighbour: any; weight: any; result: any; }[] = [];
    ; // array dei risultati della simulazione

      for (let weight = start; weight <= stop; weight += step) { // itera attraverso i valori di peso desiderati
        const simulatedGraph = JSON.parse(JSON.stringify(graph)); // crea una copia del grafo per la simulazione

        simulatedGraph.nodes[node][neighbour] = weight; // aggiorna il peso dell'arco nella copia del grafo con il valore corrente
        const result = await executeModel(simulatedGraph, req.body.startnode, req.body.endnode); // esegui la soluzione del modello con il peso dell'arco aggiornato

        if (bestResult === null || result.cost > bestResult) { // confronta il risultato corrente con il miglior risultato registrato finora
          bestResult = result.cost;
          bestConfig = {
            node: node,
            neighbour: neighbour,
            weight: weight,
          };
        }
        simulationResults.push({ // aggiungi il risultato corrente all'array dei risultati della simulazione
          node: node,
          neighbour: neighbour,
          weight: weight,
          result: result.cost,
        });
      }
      res.status(200).json({ simulationResults: simulationResults, bestResult: bestResult, bestConfig: bestConfig }); // restituisci l'array dei risultati della simulazione e il miglior risultato con la relativa configurazione di peso
    } catch (error) {
      res.status(500).json({ message: 'Errore durante la simulazione dei pesi dell\'arco' });
    }
  };

  
  /**
  * Aggiornamento del budget dell'utente in base al valore previsto dall'admin.
  */
  public creditCharge = async (req, res) => {
    try {
      if (Number(req.user.budget) > 0) {
        let oldBudget: any = await user.getBudget(req.user.emailuser);
        let newBudget = oldBudget.budget + Number(req.user.budget);
        user.budgetUpdate(newBudget, req.user.emailuser); // aggiorna il budget dell'utente, aggiungendo il numero di token dato dall'admin
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


/**
* Funzione per eseguire il modello e restituire il percorso ottimo con il costo associato.
*/
function executeModel(graph: any, start: any, goal: any): { path: any; cost: any; } {
    const route = new Graph(graph);
    const options = {
      cost: true // include il costo nel risultato
    };
    const result = route.path(start, goal, options); // utilizza la funzione `path` per ottenere il percorso ottimo con il costo associato
    if (result.path === null) {
      throw new Error('Impossibile trovare un percorso tra il nodo di partenza e il nodo di arrivo.');
    }
    return { // restituisci sia il percorso ottimo che il costo del percorso
      path: result.path,
      cost: result.cost
    }
  };

/**
* Funzione che calcola il numero di archi in un grafo.
*/
function countEdges(nodes): number {
  let numEdges = 0;
  for (const node in nodes) {
    numEdges += Object.keys(nodes[node]).length;
  }
  return numEdges;
};