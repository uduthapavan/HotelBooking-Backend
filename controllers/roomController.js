import {v2 as cloudinary} from "cloudinary"
import Hotel from "../models/Hotel.js"
import Room from "../models/Room.js"



// Api to create a new for a hotel
export const createRoom=async (req,res) => {
    try {
        const {roomType,pricePerNight,amenities}=req.body
        const hotel =await Hotel.findOne({owner:req.auth.userId})
        if(!hotel){
            return res.json({success:false,message:"No Hotel found"})
        }

        // upload imgs to cloudinary using multer
        const uploadImages=req.files.map(async (file) => {
            const response= await cloudinary.uploader.upload(file.path);
            return response.secure_url;
        })

        // wait for all uploads to complete
        const images=await Promise.all(uploadImages)

        await Room.create({
            hotel:hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities:JSON.parse(amenities),
            images,
        })
        res.json({success:true,message:"Room created successfully"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }

}

// APi to get all rooms
export const getRooms=async (req,res) => {
    try {
        
        //populate() is used to join documents from related collections (like SQL JOINs).
        //populate	Automatically fetch and replace ObjectIds with full documents
        const rooms=await Room.find({isAvailable:true}).populate({
            path:'hotel', //entire hotel data
            populate:{
                path:'owner', //owner data
                select:'image' // limits owner img
            }
        }).sort({createdAt:-1})  //sorting latest
        res.json({success:true,rooms})
    } catch (error) {
        res.json({success:false,message:error.message})
    }

}


// api to get  all rooms for a specific hotel
export const getOwnerRooms=async (req,res) => {
    try {
        const hotelData=await Hotel.findOne({owner: req.auth.userId}) //Get logged-in user's ID
        const rooms=await Room.find({hotel:hotelData._id.toString()}).populate("hotel")
        //So this part populates the full hotel data inside each room document.

        res.json({success:true,rooms})
    } catch (error) {
        res.json({success:false,message:error.message})
    }

}

//Api to toggle availabilty of a room

export const toggleRoomAvailability=async (req,res) => {
    try {
        const {roomId} =req.body
        const roomData=await Room.findById(roomId)
        roomData.isAvailable=!roomData.isAvailable
        await roomData.save(); // Commits that document to the database.


        res.json({success:true,message:"Room availability updated"})

    } catch (error) {
        res.json({success:false,message:error.message})

    }
}