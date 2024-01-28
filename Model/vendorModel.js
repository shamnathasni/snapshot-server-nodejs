const mongoose = require("mongoose");
const vendorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: "",
  },
  studioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Studio",
  },
  walletHistory: [
    {
      amount: {
        type: Number,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      from: {
        type: String,
      },
    },
  ],
});

const vendor = mongoose.model("Vendor", vendorSchema);
module.exports = vendor;
