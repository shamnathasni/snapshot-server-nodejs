const mongoose = require("mongoose")
 const studioSchema = mongoose.Schema({
    studioName:{
        type:String,
        required:true
    },
    vendorId:[{
        type:mongoose.Schema.Types.ObjectId,ref:"Vendor"
    }],
    city:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    category:{
       type:String,
       required:true 
    },
    coverImage:{
        type:String,
        default:""
    },
    galleryImage:{
        type:String,
        default:""
    }
 })

 const studio = mongoose.model("Studio", studioSchema);
 module.exports = studio;
 