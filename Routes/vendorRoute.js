const express = require("express")
const vendorRoute = express()

const vendorController = require("../Controller/vendorController")
const { uploadOptions } = require("../Config/multer")


vendorRoute.post("/signup",vendorController.vendorRegister)
vendorRoute.post("/login",vendorController.vendorLogin)
vendorRoute.post('/profileImage',uploadOptions.single('image'),vendorController.addProfileImage)

module.exports = vendorRoute