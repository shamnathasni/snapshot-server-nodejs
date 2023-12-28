const mongoose = require("mongoose")
const bookingSchema = mongoose.Schema({
    type:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    package:[{type:mongoose.Schema.Types.ObjectId}],
    studio:[{type:mongoose.Schema.Types.ObjectId}],

})

const bookings = mongoose.model("Booking",bookingSchema)
module.exports = bookings