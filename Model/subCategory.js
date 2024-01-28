const mongoose = require("mongoose");

const subCategorySchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    default: "",
  },
});

const subcategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = subcategory;
