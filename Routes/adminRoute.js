const express = require("express")
const adminRoute = express()

const adminController = require("../Controller/adminController")

adminRoute.post("/login",adminController.adminLogin)

adminRoute.post("/userlist",adminController.userList)
adminRoute.patch("/blockUser",adminController.blockUser)
adminRoute.patch("/unblockUser",adminController.unblockUser)

adminRoute.post("/vendorlist",adminController.vendorlist)
adminRoute.patch("/blockvendor",adminController.blockvendor)
adminRoute.patch("/unblockvendor",adminController.unblockvendor)

module.exports = adminRoute
