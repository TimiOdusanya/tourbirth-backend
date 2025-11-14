import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  // Production frontend URLs
  const productionUrls = [
    "tourbirth.com",
    "tourbirth-dashboard.vercel.app"
  ];

  // Testing frontend URLs
  const testingUrls = [
    "tours-one-gamma.vercel.app"
  ];

  const frontendUrl = process.env.FRONTEND_URL || "";
  

  const isProduction = productionUrls.some(url => frontendUrl.includes(url));
  const isTesting = testingUrls.some(url => frontendUrl.includes(url));

  let Db: string | undefined;
  let dbType: string;

  if (isProduction) {
    Db = process.env.MONGO_URI_PROD;
    dbType = "Production";
    if (!Db) {
      throw new Error("❌ Production mode detected but MONGO_URI_PROD is not defined! Please set MONGO_URI_PROD in your .env file.");
    }
  } else {
    Db = process.env.MONGO_URI;
    dbType = isTesting ? "Testing" : "Development";
    if (!Db) {
      throw new Error("❌ MONGO_URI is not defined in the environment variables!");
    }
  }

  try {
    await mongoose.connect(Db);
    console.log(`Successfully connected to ${dbType} database`);
    console.log(`Frontend URL: ${frontendUrl || "Not set"}`);
  } catch (err) {
    console.error(`❌ ERROR - MONGODB CONNECTION ERROR (${dbType})`, "connecting to database failed", err);
    throw err;
  }
};

export default connectDB;
