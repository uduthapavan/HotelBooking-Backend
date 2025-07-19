

// GET  /api/user/

export const getUserData=async (req,res) => {
    try {
        const role=req.user.role;  //getting data from DB using middleware authmiddleware.js
        const recentSearchedCities=req.user.recentSearchedCities;
        res.json({success:true,role,recentSearchedCities})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
    
}

// store user recent searched cities
export const storeRecentSearchedCities=async (req,res) => {
    try {
        const {recentSearchedCity}=req.body; //we will do this in web
        const user=await req.user;
        if(user.recentSearchedCities.length<3){
            user.recentSearchedCities.push(recentSearchedCity)
        }else{
            user.recentSearchedCities.shift()  //Removes the first searched element of an array (at index 0) first searched city if len>=3
            user.recentSearchedCities.push(recentSearchedCity)
        }
        await user.save();  //user.save() will validate the schema before saving.
        res.json({success:true,message:"City added"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
    
}