const mongoose = require("mongoose");
const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subcategory: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }],
  is_Verified: {
    type: Boolean,
    default: false,
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
