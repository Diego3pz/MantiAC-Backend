import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/db';
import equipmentRoutes from './routes/equipmentRoutes';

dotenv.config()
connectDB()

const app = express()
app.use(express.json())

// Routes
app.use('/api/equipments', equipmentRoutes)

export default app