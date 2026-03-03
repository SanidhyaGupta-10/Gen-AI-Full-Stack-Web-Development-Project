import app from "./src/app";
import "dotenv/config";
import connectDB from "./src/config/db";
import main from "./src/services/ai.service";

const PORT = process.env.PORT! || 3000;

main()

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
});