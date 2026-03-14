import app from "./src/app";
import "dotenv/config";
import connectDB from "./src/config/db";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

startServer();