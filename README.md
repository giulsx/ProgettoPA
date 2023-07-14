# ProgettoPA

L’obiettivo è quello di realizzare un back-end che consenta di gestire e valutare di modelli di ottimizzazione su grafo. In particolare il sistema deve prevedere la possibilità di gestire l’aggiornamento di pesi effettuato da utenti autenticati.
Nel dettaglio le richieste sono le seguenti:
-Dare la possibilità di creare un nuovo modello seguendo l’interfaccia definita nella sezione API di https://www.npmjs.com/package/node-dijkstra ed in particolare di specificare il grafo con i relativi pesi.
	-in particolare, è necessario validare la richiesta di creazione del modello
	-per ogni modello valido deve essere addebitato un numero di token in accordo con quanto segue: 0.15 per ogni nodo e 0.01 per ogni arco
	-il modello può essere creato se c’è credito sufficiente ad esaudire la richiesta.
	
-Eseguire il modello fornendo un nodo di partenza ed uno di arrivo, per ogni esecuzione deve essere applicato un costo pari a quello addebitato nella fase di creazione. Ritornare il risultato sotto forma di JSON. Il risultato deve anche considerare il tempo impiegato per l’esecuzione. L’esecuzione del modello deve prevedere ovviamente la necessità di specificare start, goal. Ritornare il percorso ed il costo associato a tale percorso.

-Gestire le richieste di cambio di peso per uno o più archi da parte degli utenti autenticati.
	-si procede con aggiornare il peso dell’arco mediante una media esponenziale del tipo p(i,j) = alpha * p(i,j) + (1 - alpha) * p_new(i,j) dove p(i,j) è il precedente costo associato all’arco che collega nodi i-j e p_new è il nuovo costo suggerito dall’utente. Alpha è uguale per tutti i modelli e deve essere gestito mediante una variabile di env. alpha deve essere > 0 e < 1; valori errati nella variabile di env devono determinare l’avvio del sistema con una configurazione pari ad alpha = 0.9

-Restituire l’elenco delle versioni dei pesi di un dato modello eventualmente filtrando per: data di modifica, numero di nodi, numero di archi.
-Effettuare una simulazione che consente di variare il peso relativo ad un arco specificando il valore di inizio, fine e passo di incremento:
	-le richieste di simulazione devono essere validate 
	-è necessario ritornare l’elenco di tutti i risultati; ritornare anche il best result con la relativa configurazione dei pesi che sono stati usati.

-le richieste devono essere validate.
-ogni utente autenticato (con JWT) ha un numero di token (valore iniziale impostato nel set del database)
-nel caso di token terminati ogni richiesta da parte dello stesso utente deve restituire 401 Unauthorized.
-Prevedere una rotta per l’utente con ruolo admin che consenta di effettuare la ricarica per un utente fornendo la mail ed il nuovo credito (sempre mediante JWT). I token JWT devono contenere i dati essenziali.
-Il numero residuo di token deve essere memorizzato del database sopra citato.
-Si deve prevedere degli script di seed per inizializzare il sistema. Nella fase di dimostrazione (demo) è necessario prevedere almeno due modelli diversi con almeno due versioni con una complessità minima di 8 nodi e 16 archi.
Si chiede di utilizzare le funzionalità di middleware sollevando le opportune eccezioni.


## FRAMEWORK/LIBRERIE
[Node.js] (https://nodejs.org/it/)
[Express] (https://expressjs.com/it/)
[Sequelize] (https://sequelize.org/)
RDBMS—Postgres (https://postgresql.org/)
[node-dijkstra] (https://www.npmjs.com/package/node-dijkstra)

## PROGETTAZIONE
I requisiti prevedono l’utilizzo di un token JWT per ogni richiesta, in essi saranno contenuti i dati essenziali.
In base all’utilizzo del sistema ci sono due tipologie di utilizzatori: utenti e admin. I token gestiti dai middleware saranno di due tipologie.
Il token relativo all’utente contiene l’email dell’utente e il ruolo (che per l’utente è pari a 1):
{payload}
Il token relativo all’utente contiene l’email, il ruolo (che per l’admin è pari a 2), l’email dell’utente a cui deve fare la ricarica e il budget da aggiungere a tale utente.
{payload}

### —newModel
La prima rotta inserita è quella relativa all’inserimento di un nuovo modello nel database. 

### —solveModel
La seconda rotta inserita permette l’esecuzione del modello, l’utente deve inserire il nome del modello e la relativa versione.
Un esempio di richiesta:
{
    "namemodel": "grafo_uno",
    "version": 1,
    "start": "A",
    "goal": "H"
}

### —admin
La terza rotta è quella che permette ad un admin di ricaricare il budget di un utente.

### —filterModels
La quarta rotta ha la funzionalità di filtrare le versioni di un modello presenti nel database, la scelta di filtraggio può essere eseguita in base alla data di creazione, al numero di nodi e al numero di archi. 
Un esempio di richiesta:
{
  "namemodel": "grafo_uno",
  "date": "7/10/2023",
  "numnodes": 8,
  "numedges": 16
}

### —getSimulation
Un esempio di richiesta:
{
    "namemodel": "grafo_uno",
    "version": 1
    "node": "A",
    "neighbour": "B",
    "start": 1,
    "stop": 0.5,
    "step": 3,
    "startnode" "A",
    "endnode": "H"
}

### —updateEdgesWeights

Un esempio di richiesta:
{
  "namemodel": "grafo_1",
  "version": 1,
  "edges": [
    {
      "node": "A",
      "neighbour": "B",
      "newWeight": 4
    },
    {
      "node": "A",
      "neighbour": "C",
      "newWeight": 3
    }
  ]
}
