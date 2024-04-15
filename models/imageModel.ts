
import DbTool from "../utils/dbTool";
import {DataTypes, Model, Optional} from "sequelize";

interface ImageAttributes {
    id: number;
    user_id: number | null;
    image_path: string;
    detect_path: string | null;
    detect: boolean | null;
}

interface ImageCreationAttributes extends Optional<ImageAttributes, 'id'> {}

class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
    public id!: number;
    public user_id!: number | null;
    public image_path!: string;
    public detect_path!: string | null;
    public detect!: boolean | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const sequelize = new DbTool().sequelize;

Image.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        image_path: {
            type: new DataTypes.STRING(255),
            allowNull: false,
        },
        detect_path: {
            type: new DataTypes.STRING(255),
            allowNull: true,
        },
        detect: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        }
    },
    {
        tableName: 'Image',
        sequelize,
    }
);

export default Image;
