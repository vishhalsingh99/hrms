import dotenv from "dotenv";
import app from "./src/app.js";
import { sequelize } from "./src/models/index.js"; 

dotenv.config({
    path: "./.env"
});

const PORT = process.env.PORT || 5000;


const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ MySQL Database connected successfully.");

        if (process.env.NODE_ENV === "development") {
            await sequelize.sync({ force: false });
            console.log("✅ Database models synced.");
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server is running at: http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ MySQL connection failed:", error);
        process.exit(1);
    }
};

startServer();