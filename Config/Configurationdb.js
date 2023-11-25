const mongoose = require("mongoose")

module.exports=async function(){
   await mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("DB connected");
      })
      .catch((err) => {
        console.log(err);
      });
}