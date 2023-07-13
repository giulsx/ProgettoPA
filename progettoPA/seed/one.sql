CREATE DATABASE prga;
\c prga

CREATE TABLE users(
  email varchar(50) NOT NULL,
  budget REAL NOT NULL
);

CREATE TABLE models(
  id SERIAL PRIMARY KEY,
  namemodel varchar(50) NOT NULL,
  nodes json NOT NULL,
  version INTEGER NOT NULL,
  cost NUMERIC,
  creation_date varchar(50) NOT NULL,
  valid boolean
);

-- 2 utenti
INSERT INTO users(email, budget) VALUES
('user@email.com', 15),
('giulia@email.com', 100);

-- primo modello (grafo con 8 nodi e 16 archi)
INSERT INTO models(namemodel, nodes, version, cost, creation_date, valid) VALUES
('grafo_uno',
'{
  "A": { "B": 1, "C": 2 },
  "B": { "A": 1, "C": 3, "D": 2 },
  "C": { "A": 2, "B": 3, "D": 1, "E": 4 },
  "D": { "B": 2, "C": 1, "E": 3, "F": 2 },
  "E": { "C": 4, "D": 3, "F": 1, "G": 2 },
  "F": { "D": 2, "E": 1, "G": 3, "H": 4 },
  "G": { "E": 2, "F": 3, "H": 1 },
  "H": { "F": 4, "G": 1 }
}',
1,
1.36,
'7/10/2023',
true
);

-- secondo modello (grafo con 8 nodi e 16 archi)
INSERT INTO models(namemodel,nodes,version,cost,creation_date,valid) VALUES
('grafo_due',
'{
  "A": { "B": 3, "C": 2, "D": 4 },
  "B": { "A": 3, "C": 1, "E": 2 },
  "C": { "A": 2, "B": 1, "D": 5, "E": 3 },
  "D": { "A": 4, "C": 5, "F": 2 },
  "E": { "B": 2, "C": 3, "F": 4, "G": 1 },
  "F": { "D": 2, "E": 4, "G": 3, "H": 2 },
  "G": { "E": 1, "F": 3, "H": 1 },
  "H": { "F": 2, "G": 1 }
}',
1,
1.36,
'7/10/2023',
true
);

-- seconda versione del primo modello (cambio peso degli archi (A,B) e (A,C))
INSERT INTO models(namemodel,nodes,version,cost,creation_date,valid) VALUES
('grafo_uno',
'{
  "A": { "B": 4, "C": 3 },
  "B": { "A": 4, "C": 3, "D": 2 },
  "C": { "A": 3, "B": 3, "D": 1, "E": 4 },
  "D": { "B": 2, "C": 1, "E": 3, "F": 2 },
  "E": { "C": 4, "D": 3, "F": 1, "G": 2 },
  "F": { "D": 2, "E": 1, "G": 3, "H": 4 },
  "G": { "E": 2, "F": 3, "H": 1 },
  "H": { "F": 4, "G": 1 }
}',
2,
1.36,
'7/10/2023',
true
);

-- seconda versione del secondo modello (cambio peso degli archi (A,B), (A,C) e (A,D))
INSERT INTO models(namemodel,nodes,version,cost,creation_date,valid) VALUES
('grafo_due',
'{
  "A": { "B": 2, "C": 1, "D": 3 },
  "B": { "A": 2, "C": 1, "E": 2 },
  "C": { "A": 1, "B": 1, "D": 5, "E": 3 },
  "D": { "A": 3, "C": 5, "F": 2 },
  "E": { "B": 2, "C": 3, "F": 4, "G": 1 },
  "F": { "D": 2, "E": 4, "G": 3, "H": 2 },
  "G": { "E": 1, "F": 3, "H": 1 },
  "H": { "F": 2, "G": 1 }
}',
2,
1.36,
'7/10/2023',
true
);
