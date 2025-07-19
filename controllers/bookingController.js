import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// funtion to check availability of room
const checkAvailability=async ({checkInDate, checkOutDate ,room}) => {
    try {
        const bookings=await Booking.find({
            room,
            checkInDate:{$lte:checkOutDate},
            checkOutDate:{$gte:checkInDate}
        });
        const isAvailable=bookings.length===0;
        return isAvailable;
    } catch (error) {
        console.error(error.message)
    }
}
// api to check availabilty of rooom
// post/api/bookings/check-avaliability
export const checkAvailabilityAPI=async (req,res) => {
    try {
        const {room,checkInDate,checkOutDate}=req.body
        const isAvailable=await checkAvailability({checkInDate, checkOutDate ,room})
        res.json({success:true,isAvailable})
    } catch (error) {
                res.json({success:false,message:error.message})

    }
}

// api to create new booking
// post/api/bookings/book

export const createBooking=async (req,res) => {
    try {
        const {room,checkInDate,checkOutDate,guests}=req.body
        const user=req.user._id

        // before booking check availability
        const isAvailable=await checkAvailability({checkInDate,checkOutDate,room})
        if(!isAvailable){
            return res.json({success:false, message:"Room is not avaliable"})
        }

        // get totalprice for room
        const roomData=await Room.findById(room).populate("hotel");
        let totalPrice=roomData.pricePerNight;

        // calculate totalPrice based on nights
        const checkIn=new Date(checkInDate)
        const checkOut=new Date(checkOutDate)
        const timeDiff=checkOut.getTime()-checkIn.getTime();
        const nights=Math.ceil(timeDiff/(1000*3600*24));

        totalPrice*=nights
        const booking=await Booking.create({user,room,
            hotel:roomData.hotel._id,
            guests:+guests, //convert to number
            checkInDate,checkOutDate,totalPrice
        })

        // nodemailer transporter
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:req.user.email,
            subject:'Hotel Booking Details',
            html:`
                <h2>Your Booking Details</h2>
                <p>Dear ${req.user.username},</p>
                <p>Thank you for your booking! Here are your details:</p>
                <ul>
                    <li><strong>Booking ID:</strong>${booking._id}</li>
                    <li><strong></strong>${roomData.hotel.name}</li>
                    <li><strong></strong>${roomData.hotel.address}</li>
                    <li><strong></strong>${booking.checkInDate.toDateString()}</li>
                    <li><strong></strong>${process.env.CURRENCY || '$'} ${booking.totalPrice} /night</li>

                </ul>
                <p>We look forward to welcoming you</p>
                <p>If you need to make any changes, feel free to contact us.</p> `

        }
        await transporter.sendMail(mailOptions)

        res.json({success:true,message:"Booking created successfully"})
  
    } catch (error) {
        console.error("Booking error:", error)
        res.json({success:false,message:"Failed to create booking"})

    }
}

//  api to get all bookings for a user
// Get /api/bookings/user
export const getUserBookings=async (req,res) => {
    try {
        const user=req.user._id
        const bookings=await Booking.find({user}).populate("room hotel").sort({createdAt:-1})

        res.json({success:true,bookings})
    } catch (error) {
        res.json({success:false,message:"Failed to fetch bookings"})
    }
}

export const getHotelBookings=async (req,res) => {
    try {
         const hotel=await Hotel.findOne({owner:req.auth.userId})
    if(!hotel){
        return res.json({success:false,message:"No Hotel Found"})
    }
    const bookings=await Booking.find({hotel:hotel._id}).populate("room hotel user").sort({createdAt:-1})

    //total bookings
    const totalBookings=bookings.length;

    //total revenue
    const totalRevenue=bookings.reduce((acc,booking)=>acc+booking.totalPrice,0)  //acc=0
    res.json({success:true,dashboardData:{totalBookings,totalRevenue,bookings}})
    } catch (error) {
        res,json({success:false,message:"Failed to fetch bookings"})
    }
}