import mongoose from "mongoose";

const connectDB=async () => {
    try {

        // event tocheck
        mongoose.connection.on('connected',()=>console.log("Database connected"))
        await mongoose.connect(`${process.env.MONGODB_URI}/Hotel-Booking`)
    } catch (error) {
        console.log(error.message); //to print in terminal
    }
    
}
export default  connectDB;