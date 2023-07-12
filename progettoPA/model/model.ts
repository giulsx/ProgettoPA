import { DataTypes, Op, IntegerDataType, Model, Sequelize } from "sequelize";
import { SingletonDB } from "../model/database";

const Graph = require('node-dijkstra');

const sequelize = SingletonDB.getInstance().getConnection();

export const Graphs = sequelize.define(
  "graph",
  {  namemodel: {
    type: DataTypes.STRING,
    allowNull: false,
    },
    nodes: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    creation_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    valid: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    modelName: "graphs",
    timestamps: false,
  }
);

export async function insertModel(object: any, cost: number) {
  const date = new Date().toLocaleDateString();

  const model = await Graphs.create({
    namemodel: object.name, 
    nodes: object.nodes,
    creation_date: date,
    version: 1, 
    cost: cost,
    valid: true,
  });

  return model;
}

export async function insertUpdate(object: any, version: number) {
  const date = new Date().toLocaleDateString();

  const model = await Graphs.create({
    namemodel: object.name,
    nodes: object.nodes,
    creation_date: date,
    version: version, //in fase di aggiornamento viene incrementato
    cost: object.cost,
    valid: true,
  });

  return model;
}

export async function checkExistingModel(namemodel: string, version?: number) {
  if (version) {
    const graphs = await Graphs.findOne({
      where: { namemodel: namemodel, version: version },
    });
    return graphs;
  } else {
    const lastVersion: number = await Graphs.max('version', {
      where: { namemodel: namemodel },
    });
    const graphs = await Graphs.findOne({
      where: { namemodel: namemodel, version: lastVersion },
    });
    return graphs;
  }
}

export async function getModel(name: string) {
  const graphs = await Graphs.findAll({
    where: {
      namemodel: name,
      version: { [Op.gt]: 1 }, // Operator greater, per tornare solo le revisioni (versione >1)
      valid: { [Op.eq]: true }, // operator equal, per tornare solo i validi (non logicamente cancellati)
    },
  });
  return graphs;
}
