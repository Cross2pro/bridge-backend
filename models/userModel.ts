import { DataTypes, Model, Optional } from "sequelize";
import DbTool from "../utils/dbTool";

interface UserAttributes {
    id: number;
    username: string;
    password: string;
    email: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public password!: string;
    public email!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const sequelize = new DbTool().sequelize;

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
        }
    },
    {
        tableName: 'User',
        sequelize,
    }
);

export default User;
