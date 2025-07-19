import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/db.js'
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from './controllers/clerkWebhook.js'
import userRouter from './routes/userRoutes.js'
import hotelRouter from './routes/hotelRoutes.js'
import connectCloudinary from './configs/cloudinary.js'
import roomRouter from './routes/roomRoutes.js'
import bookingRouter from './routes/bookingRoutes.js'


connectDB()
connectCloudinary()

const app=express()
app.use(cors({
  origin: 'https://hotel-booking-front-end-zeta.vercel.app',
  credentials: true // if you are using cookies/JWT in headers
}));

//enable cross origin resource

//middleware
app.use(express.json())  //all api req using json
app.use(clerkMiddleware())

// api to listen to clerkwebhooks with endpoint /api/clerk
app.use("/api/clerk",clerkWebhooks)



app.get('/',(req,res)=>res.send("API is working fine"))

app.use('/api/user',userRouter)
app.use('/api/hotels',hotelRouter)
app.use('/api/rooms',roomRouter)
app.use('/api/bookings',bookingRouter)

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>console.log(`server running on port ${PORT}`));