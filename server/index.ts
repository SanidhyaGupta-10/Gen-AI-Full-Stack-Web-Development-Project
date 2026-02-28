import app from "./src/app";
import "dotenv/config";
import connectDB from "./src/config/db";

const PORT = process.env.PORT! || 3000;

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
});