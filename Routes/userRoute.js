 const express = require("express")
 const userRoute = express()

 const userController = require("../Controller/userController")
const { uploadOptions } = require("../Config/multer")


 userRoute.post("/Signup",userController.userRegister)
 userRoute.post("/verifyOtp",userController.verifyUserOtp)
 userRoute.post("/resendOtp",userController.resendUserOtp)
 userRoute.post("/login",userController.userLogin)
 userRoute.post('/profileImage',uploadOptions.single('image'),userController.addProfileImage)

 userRoute.get('/categorylist',userController.getCategoryList)
 userRoute.get('/studiolist',userController.getStudioList)
 userRoute.get('/singleStudio',userController.getSinglStudio)
 userRoute.get('/studioPackages',userController.getStudioPackages)

 userRoute.post("/bookingData",userController.postBooking)
 userRoute.get("/bookedates",userController.getBookingDates)
 userRoute.get("/isBookedDate",userController.getIsBookedDate)
 userRoute.post("/api/create-checkout-session",userController.paymentBooking)
 userRoute.get("/confirmpayment",userController.confirmPayment)
 userRoute.get("/bookingdetails",userController.getBookingdetails)

 module.exports = userRoute
 