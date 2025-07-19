import mongoose from "mongoose";

const userSchema= mongoose.Schema({
    _id:{type:String,required:true},
    username:{type:String,required:true},
    email:{type:String,required:true},
    image:{type:String,required:true},
    role:{type:String,enum:["user","hotelOwner"],default:"user"},
    // enum restricted to a predefined set of options
    recentSearchedCities:[{type:String,required:true}]

},{timestamps:true});
// timestamps when user created

// user is created through clerk 

const User=mongoose.model('User',userSchema);

export default User