import User from "../models/User.js";

import { Webhook } from "svix";

const clerkWebhooks=async (req,res) => {
    try {
        // create svix instance with clerk webhook secret  as api
        const whook=new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        //GETTING HEADRES
        const headers={
            "svix-id":req.headers['svix-id'],
            'svix-timestamp':req.headers['svix-timestamp'],
            "svix-signature":req.headers['svix-signature']
        }
        //  headers are key-value pairs sent along with HTTP requests and responses that carry metadata ,Secure APIs with tokens (Auth)
        //svix verify headers created from svix and req.body.webhook key
        await whook.verify(JSON.stringify(req.body),headers)

        // getting data from req.body
        const {data,type}=req.body     //Extracts only what you need from req.body

      

        //swith cases for different events of clerk
        switch(type){
            case "user.created":{
            const userData={
            _id:data.id,
            email:data.email_addresses[0].email_address,
            username:data.first_name + " " + data.last_name,
            image:data.image_url,
        }
                await User.create(userData);
                break;
            }
            case "user.updated":{
            const userData={
            _id:data.id,
            email:data.email_addresses[0].email_address,
            username:data.first_name + " " + data.last_name,
            image:data.image_url,
        }
                await User.findByIdAndUpdate(data.id,userData);
                break;
            }
            case "user.deleted":{
                await User.findByIdAndDelete(data.id);
                break;
            }
            default:
                break;
        }
        res.json({success:true,message:"Webhook Received"})

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
    
}

export default clerkWebhooks