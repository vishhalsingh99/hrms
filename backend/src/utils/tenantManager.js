import { Sequelize } from "sequelize";

export const createTenantDatabase = async ( dbName ) => {
    const masterSequelizer = new Sequelize ('mysql', 'username', 'password', {
        host: 'localhost',
        dialect: 'mysql'
    });

    try {
        await masterSequelizer.query(`CREATE DATABASE ${dbName} `);
        console.log(`✅ DB ${dbName} Created Successfully!`);
    } catch (error) {
        console.log("❌ Tenant DB creation failed", error);
    } finally {
        masterSequelizer.close();
    }
}