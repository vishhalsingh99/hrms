import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";




import authRoutes from "./routes/authRoutes.js";


const app = express();

// --- GLOBAL MIDDLEWARES ---

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing (Frontend connection)
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.use(morgan("dev"));

// --- ROUTES ---

// Health Check (To verify if server is alive)
app.get("/api/v1/health", (req, res) => {
    // res.status(200).json({ success: true, message: "System is Operational" });
    throw new Error("System is Operational");
});



app.use("/api/v1/auth", authRoutes);

// --- ERROR HANDLING ---

app.use(errorMiddleware);

export default app;