import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connection established successfully")
    } catch (error) {
        console.log("MongoDB connection error:", error)
        console.log("⚠️  Server will continue without database connection")
        // Don't exit - allow server to run for testing
    }
}
