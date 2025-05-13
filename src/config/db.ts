import mongoose from "mongoose";
import colors from "colors";


export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(colors.cyan.bold("Base de datos conectada en: " + url));
    } catch (error) {
        console.log(colors.red("Error al conectar a la base de datos"));
        console.log(colors.red(error));
        process.exit(1);
    }
}