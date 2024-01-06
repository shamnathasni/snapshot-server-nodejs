const mongoose = require("mongoose");
const bookingSchema = mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
  },
  studio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Studio",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  chat: [
    {
      from: { type: String, required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const bookings = mongoose.model("Booking", bookingSchema);
module.exports = bookings;
