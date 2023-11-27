 const express = require("express")
 const userRoute = express()

 const userController = require("../Controller/userController")
const { uploadOptions } = require("../Config/multer")


 userRoute.post("/Signup",userController.userRegister)
 userRoute.post("/login",userController.userLogin)
 userRoute.post('/profileImage',uploadOptions.single('image'),userController.addProfileImage)

 module.exports = userRoute
