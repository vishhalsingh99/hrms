import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Company = sequelize.define("Company", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true
    },
    logo: {
        type: DataTypes.STRING,
        defaultValue: "default_logo_url"
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
    },
    plan: {
        type: DataTypes.ENUM('free', 'pro', 'enterprise'),
        defaultValue: 'free'
    },
    isVerified : {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    dbConfig: {
        type: DataTypes.JSON, // Isme host, port, db name save kar sakte ho
        allowNull: true
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
    }

},
{
    timestamps: true,
    tableName: 'companies'
})

export default Company;