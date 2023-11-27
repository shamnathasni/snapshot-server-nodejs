const mongoose = require("mongoose")
 const vendorSchema = mongoose.Schema({
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
    }
 })

 const vendor = mongoose.model("Vendor", vendorSchema);
 module.exports = vendor;