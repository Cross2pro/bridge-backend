import { Sequelize } from 'sequelize';
import dotenv from "dotenv";

dotenv.config();

const db_ConsolePrefix="[DB] "
class DbTool {
    sequelize: Sequelize;

    constructor() {
        this.sequelize = new Sequelize(
            process.env.DB_NAME || 'default_database_name',
            process.env.DB_USER || 'default_username',
            process.env.DB_PASSWORD || 'default_password',
            {
                host: process.env.DB_HOST || 'default_host',
                dialect: 'mysql',
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                },
                logging: false
            }
        );
    }

    async connect() {
        try {
            await this.sequelize.authenticate();
            console.log(`${db_ConsolePrefix}Connection has been established successfully.`);
        } catch (error) {
            console.error(`${db_ConsolePrefix}Unable to connect to the database:`, error);
        }
    }

    async disconnect() {
        try {
            await this.sequelize.close();
            console.log(`${db_ConsolePrefix}Connection has been successfully closed.`);
        } catch (error) {
            console.error(`${db_ConsolePrefix}Unable to close the connection:`, error);
        }
    }

    getSequelize() {
        return this.sequelize;
    }
}

export default DbTool;