const mongoose = require("mongoose")
const packageSchema = mongoose.Schema({
    subcategory:{
        type:String,
        required:true
    },
    camera:{
        type:String,
        required:true
    },
    video:{
        type:String,
        required:true
    },
    both:{
        type:String,
        required:true
    },
   
    studioId:{type:mongoose.Schema.Types.ObjectId},
})

const package = mongoose.model("Package",packageSchema)
module.exports = package