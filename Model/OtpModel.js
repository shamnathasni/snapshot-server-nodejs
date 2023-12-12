const mongoose = require("mongoose")
const otpSchema = mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        required:true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }

})

otpSchema.index({createdAt: 1}, {expireAfterSeconds: 10})
const otp = mongoose.model("Otp",otpSchema)
module.exports = otp