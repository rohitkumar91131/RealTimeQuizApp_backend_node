import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  String(process.env.DB_PASSWORD),
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    port: process.env.DB_PORT || 5432,
    logging: false,
    dialectOptions: process.env.DB_SSL === "true" ? {
      ssl: {
        require: true,
        rejectUnauthorized: false, 
      },
    } : undefined,
  }
);

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error.message);
    process.exit(1);
  }
}

export default sequelize;
