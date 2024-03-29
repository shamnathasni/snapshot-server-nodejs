const express = require("express");
const adminRoute = express();

const adminController = require("../Controller/adminController");
const { uploadOptions } = require("../Config/multer");

adminRoute.post("/login", adminController.adminLogin);

adminRoute.post("/userlist", adminController.userList);
adminRoute.patch("/blockUser", adminController.blockUser);
adminRoute.patch("/unblockUser", adminController.unblockUser);

adminRoute.post("/vendorlist", adminController.vendorlist);
adminRoute.patch("/blockvendor", adminController.blockvendor);
adminRoute.patch("/unblockvendor", adminController.unblockvendor);

adminRoute.post("/studiolist", adminController.studioList);
adminRoute.get("/bookinglist", adminController.bookingList);

adminRoute.get("/categorylist", adminController.categoryList);
adminRoute.post("/addcategory", adminController.addCategory);
adminRoute.patch("/categoryunlist", adminController.unlistCategory);
adminRoute.patch("/categorylist", adminController.listCategory);

adminRoute.get("/subcategorylist/:categoryId", adminController.subCategoryList);
adminRoute.post(
  "/addsubCategory/:categoryId",
  uploadOptions.single("image"),
  adminController.addSubCategory
);

adminRoute.post("/bookings-by-month", adminController.postMonthlyBookings);
adminRoute.post("/vendorgraph", adminController.postVendorGraph);
adminRoute.post("/usergraph", adminController.postUserGraph);

module.exports = adminRoute;
