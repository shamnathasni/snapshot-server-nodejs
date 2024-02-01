const express = require("express");
const userRoute = express();

const userController = require("../Controller/userController");
const { uploadOptions } = require("../Config/multer");

userRoute.post("/Signup", userController.userRegister);
userRoute.post("/google", userController.googleAuth);
userRoute.post("/verifyOtp", userController.verifyUserOtp);
userRoute.post("/resendOtp", userController.resendUserOtp);
userRoute.post("/login", userController.userLogin);
userRoute.post(
  "/profileImage",
  uploadOptions.single("image"),
  userController.addProfileImage
);

userRoute.get("/categorylist", userController.getCategoryList);
userRoute.get("/studiolist", userController.getStudioList);
userRoute.get("/singleStudio", userController.getSingleStudio);
userRoute.get("/studioPackages", userController.getStudioPackages);
userRoute.get("/categoryStudioList", userController.getCategoryStudioList);

userRoute.post("/bookingData", userController.postBooking);
userRoute.get("/detailsforpayment", userController.postPaymentDetails);
userRoute.post("/bookedates", userController.getBookingDates);
userRoute.post("/isBookedDate", userController.getIsBookedDate);
userRoute.post("/api/create-checkout-session", userController.paymentBooking);
userRoute.get("/confirmpayment", userController.confirmPayment);
userRoute.get("/bookingdetails", userController.getBookingdetails);
userRoute.get("/chatdetails", userController.getChatdetails);
userRoute.get("/getVendorDetails", userController.getVendorDetails);
userRoute.get("/search", userController.getSearchData);

userRoute.post("/rating", userController.postRating);

module.exports = userRoute;
