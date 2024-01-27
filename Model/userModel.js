const mongoose = require("mongoose")
 const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    number:{
        type:String,
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
    
    }],
    wallet:{
        type:Number,
        default:0
    },
    walletHistory:[{
        amount:{
            type:Number
        },
        date:{
            type:Date,
            default:Date.now
        }
    }]
 })

 const user = mongoose.model("User", userSchema);
 module.exports = user;
 