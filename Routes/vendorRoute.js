const express = require("express")
const vendorRoute = express()

const vendorController = require("../Controller/vendorController")
const { uploadOptions } = require("../Config/multer")


vendorRoute.post("/signup",vendorController.vendorRegister)
vendorRoute.post("/login",vendorController.vendorLogin)
vendorRoute.post('/profileImage',uploadOptions.single('image'),vendorController.addProfileImage)

vendorRoute.get("/studio",vendorController.vendorStudio)
vendorRoute.post("/studioform",uploadOptions.array('image'),vendorController.postStudioForm)
vendorRoute.get("/vendorcategory",vendorController.postvendorCategory)

module.exports = vendorRoute