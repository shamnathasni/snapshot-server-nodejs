const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Admin = require("../Model/adminModel");
const User = require("../Model/userModel");
const Vendor = require("../Model/vendorModel");
const Studio = require("../Model/studioModel");
const Category = require("../Model/categoryModel");
const SubCategory = require("../Model/subCategory");
const { default: mongoose } = require("mongoose");
const subcategory = require("../Model/subCategory");
const bookings = require("../Model/bookingModel");


const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      // Compare hashed password
      const existingAdmin = await Admin.findOne({ email: email });
      const passwordMatch = await Admin.findOne({
        password: existingAdmin.password,
      });
      if (passwordMatch) {
        const newAdmin = await Admin.findById(existingAdmin._id);
        const token = jwt.sign(
          { adminId: existingAdmin._id },
          process.env.ADMIN_SECRET_KEY,
          { expiresIn: "1d" }
        );

        res.status(200).json({
          alert: "Login successful",
          status: true,
          token,
          newAdmin,
        });
      } else {
        res.json({ alert: "Incorrect Password", status: false });
      }
    } else {
      res.json({ alert: "Incorrect Email", status: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const userList = async (req, res) => {
  try {
    const userData = await User.find({});
    if (userData) {
      res.json({ status: true, userData });
    } else {
      res.json({ status: false, userData });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const blockUser = async (req, res) => {
  try {
    const { id } = req.query;

    console.log(req.query, "qqq");

    const block = await User.updateOne(
      { _id: id },
      { $set: { is_verified: false } }
    );
    console.log(block, "llll");
    res.json({ status: true, alert: "User blocked successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(req.query, "qqqw");

    const unblock = await User.updateOne(
      { _id: id },
      { $set: { is_verified: true } }
    );
    console.log(unblock, "bbb");
    res.json({ status: true, alert: "User unblocked successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const vendorlist = async (req, res) => {
  try {
    const VendorData = await Vendor.find({});
    if (VendorData) {
      res.json({ status: true, VendorData });
    } else {
      res.json({ status: false, VendorData });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const blockvendor = async (req, res) => {
  try {
    const { id } = req.query;

    console.log(req.query, "qqq");

    const block = await Vendor.updateOne(
      { _id: id },
      { $set: { is_verified: false } }
    );
    console.log(block, "llll");
    res.json({ status: true, alert: "User blocked successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const unblockvendor = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(req.query, "qqqw");

    const unblock = await Vendor.updateOne(
      { _id: id },
      { $set: { is_verified: true } }
    );
    console.log(unblock, "bbb");
    res.json({ status: true, alert: "User unblocked successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const studioList = async (req,res) => {
  try {
    const studio = await Studio.find({}).populate("vendorId").populate("package").exec()
    res.json({status:true,studio})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false }); 
  }
}

const bookingList = async (req,res) => {
  console.log(11);
  try {
    const { studioid } = req.query
    console.log(req.query,"iii");
    const bookingData = await bookings.find({studio:studioid}).populate("package").populate("studio")
    res.json({status:true,bookingData})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false }); 
  }
}

const categoryList = async (req, res) => {
  try {
    const categoryData = await Category.find({});
    console.log("Category Data:", categoryData);

    if (categoryData.length > 0) {
      res.json({ status: true, categoryData });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const addCategory = async (req, res) => {
  try {
    console.log(111);
    const { category } = req.body;
    console.log(req.body, "bbbbb");
    const CATEGORY = category.toUpperCase();
    console.log(CATEGORY, "ccc");
    const ExistCategory = await Category.findOne({ name: CATEGORY });
    if (ExistCategory) {
      res.status(200).json({ alert: "category already exist", status: false });
    } else {
      const category = new Category({
        name: CATEGORY,
        is_Verified: true,
      });
      const newCategory = await category.save();
      console.log(newCategory);
      res.json({ alert: "category added", status: true, newCategory });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const unlistCategory = async (req, res) => {
  try {
    const { Id } = req.query;
    console.log(Id, "");
    const unlist = await Category.updateOne(
      { _id: Id },
      { $set: { is_Verified: false } }
    );
    console.log(unlist, "unlist");
    res.status(200).json({ alert: "category unlisted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};
const listCategory = async (req, res) => {
  try {
    const { Id } = req.query;
    const list = await Category.updateOne(
      { _id: Id },
      { $set: { is_Verified: true } }
    );
    console.log(list, "list");
    res.status(200).json({ alert: "category listed" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const subCategoryList = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(categoryId, "categoryId");
    const subcategoryData = await Category.findOne({
      _id: categoryId,
    }).populate("subcategory");
    console.log(subcategoryData, "ssss");
    res.json({ status: true, subcategoryData: subcategoryData.subcategory });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const addSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(categoryId, "categoryId");
    const image = req.body.image;
    console.log(req.body.image, "file");
    const name = req.body.name;
    console.log(req.params, "rbc");

    const subCat = new subcategory({
      name,
      image,
    });
    const newSubcat = await subCat.save();
    console.log(newSubcat, "newSubcat");

    const pushSubcat = await Category.updateOne(
      { _id: categoryId },
      { $push: { subcategory: { _id: newSubcat._id } } }
    );
    console.log(pushSubcat, "pushSubcat");
    res.json({ alert: "subcategory added successfully", status: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const postConfigureBooking = async (req, res) => {
  console.log(1111);
  try {
    const { packageId } = req.query;
    console.log(req.query, "id");
    //calculate wallet amount for vendor nd admin
    const booking = await bookings
      .findOne({ _id: packageId })
      .populate("studio");
    console.log(booking, "booking");
    const advance = (booking.amount * (15 / 100)).toFixed(0);
    console.log(advance, "advance");

    const AdminWallet = (advance * (5 / 100)).toFixed(0);
    console.log(AdminWallet, "AdminWallet");
    const authAdmin = req.headers.authorization;
    console.log(authAdmin, "authAdmin");
    const tokenAdmin = authAdmin.split(" ")[1];
    const decodeAdmin = jwt.verify(tokenAdmin, process.env.ADMIN_SECRET_KEY);
    console.log(decodeAdmin, "decodeAdmin");
    const updateAdminWallet = await Admin.UpdateOne(
      { _id: decodeAdmin.adminId },
      {
        $inc: { wallet: AdminWallet }, // Increment the wallet by the specified amount
        $push: {
          walletHistory: {
            amount: AdminWallet,
            date: new Date(),
            from: booking.studio.name,
          },
        },
      }
    );
    console.log(updateAdminWallet, "updateAdminWallet");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const postMonthlyBookings = async (req, res) => {
  try {
    const result = await bookings.aggregate([
      {
        $match: {
          is_verified: true,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.json({ result, status: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
};

const postVendorGraph = async (req,res)=>{
  try {
    const vendorCount = await Vendor.countDocuments()
    
    console.log(vendorCount);
    res.json({status:true,vendorCount})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
}

const postUserGraph = async (req,res)=>{
  try {
    const userCount = await User.countDocuments()
    
    console.log(userCount);
    res.json({status:true,userCount })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false });
  }
}

module.exports = {
  adminLogin,
  userList,
  blockUser,
  unblockUser,
  studioList,
  bookingList,
  vendorlist,
  blockvendor,
  unblockvendor,
  categoryList,
  addCategory,
  unlistCategory,
  listCategory,
  subCategoryList,
  addSubCategory,
  postConfigureBooking,
  postMonthlyBookings,
  postVendorGraph,
  postUserGraph
};
