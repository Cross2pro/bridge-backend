// models/contactModel.ts

import {DataTypes, Model, Optional} from "sequelize";
import DbTool from "../utils/dbTool";

interface ContactAttributes {
    id: number;
    name: string;
    email: string;
    message: string;
}

interface ContactCreationAttributes extends Optional<ContactAttributes, 'id'> {}

class Contact extends Model<ContactAttributes, ContactCreationAttributes> implements ContactAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public message!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const sequelize = new DbTool().sequelize;

Contact.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: new DataTypes.STRING(255),
            allowNull: false,
        },
        message: {
            type: new DataTypes.STRING(1024),
            allowNull: false,
        }
    },
    {
        tableName: 'Contact',
        sequelize,
    }
);

export default Contact;