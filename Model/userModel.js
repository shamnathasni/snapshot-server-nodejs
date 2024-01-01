const mongoose = require("mongoose")
 const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    number:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    image:{
        type:String,
        default:""
    },
    booking:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Booking"
    
    }]
 })

 const user = mongoose.model("User", userSchema);
 module.exports = user;
 