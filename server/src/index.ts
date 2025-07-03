import dotenv from "dotenv";
import app from "./app";

dotenv.config();

// Change PORT or set process.env.PORT to match your environment
const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
