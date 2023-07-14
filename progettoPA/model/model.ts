import { DataTypes, Op, IntegerDataType, Model, Sequelize } from "sequelize";
import { SingletonDatabase } from "../model/database";

const sequelize = SingletonDatabase.getInstance().getConnection();

export const Models = sequelize.define(
  "models",
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
    modelName: "models",
    timestamps: false,
  }
);

export async function insertModel(object: any, cost: number) {
  const date = new Date().toLocaleDateString();

  const model = await Models.create({
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

  const model = await Models.create({
    namemodel: object.name,
    nodes: object.nodes,
    creation_date: date,
    version: version,
    cost: object.cost,
    valid: true,
  });

  return model;
}


/**
 * Esistenza di un modello in base al nome e alla versione
 */
export async function checkExistingModel(namemodel: string, version: number) {
  const model = await Models.findOne({
    where: { namemodel: `${namemodel}`, version: version },
  });
  return model;
  }


export async function getModel(namemodel: string) {
  const model = await Models.findAll({
    where: {
      namemodel: namemodel,
      version: { [Op.gt]: 1 }, 
      valid: { [Op.eq]: true },
    },
  });
  return model;
}
