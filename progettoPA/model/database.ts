require('dotenv').config();
import { Sequelize} from "sequelize";


/**
 * Classe Singleton per la connessione al Database
 */
export class SingletonDatabase 
    { 
    private static instance: SingletonDatabase;
    private singleConnection: Sequelize; 

    private constructor() { 

        const db: string = process.env.PGDATABASE as string;
        const username: string = process.env.PGUSER as string;
        const password: string = process.env.PGPASSWORD as string;
        const host: string = process.env.PGHOST as string;
        const port: number = Number(process.env.PGPORT);
        this.singleConnection = new Sequelize(db, username, password, {
            host: host,
            port: port,
            dialect: 'postgres',
            dialectOptions: {

            },  
            logging:false});
            
    }

    public static getInstance(): SingletonDatabase {
        if (!SingletonDatabase.instance) {
            SingletonDatabase.instance = new SingletonDatabase();
        }
        return SingletonDatabase.instance;
    }
    public getConnection() {
        return this.singleConnection;        
    }

}