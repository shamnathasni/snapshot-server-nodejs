const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Admin = require("../Model/adminModel");
const User = require("../Model/userModel");
const Vendor = require("../Model/vendorModel");


const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email:email });
    if (existingAdmin) {
      // Compare hashed password
    const existingAdmin = await Admin.findOne({ email: email });
      const passwordMatch = await Admin.findOne({password: existingAdmin.password})
      if (passwordMatch) {
        const newAdmin = await Admin.findById(existingAdmin._id);
        const token = jwt.sign(
          { adminId: existingAdmin._id },
          process.env.ADMIN_SECRET_KEY,
          { expiresIn: "1h" }
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

const userList = async (req,res)=>{
  try {
    const userData = await User.find({})
    if (userData) {
      res.json({status:true,userData})
    } else {
      res.json({status:false,userData})
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false }); 
  }
}

const blockUser = async (req, res) => {
  try {
    const { id } = req.query;
  
    console.log(req.query,"qqq");
  
    const block = await User.updateOne({ _id: id }, { $set: { is_verified: false } })
    console.log(block,"llll");
    res.json({ status: true, alert: 'User blocked successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: 'Internal Server Error', status: false });
  }
};


const unblockUser = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(req.query,"qqqw");
   
    const unblock = await User.updateOne({ _id: id }, { $set: { is_verified: true } });
    console.log(unblock,"bbb");
    res.json({ status: true, alert: 'User unblocked successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: 'Internal Server Error', status: false });
  }
};



const vendorlist = async (req,res)=>{
  try {
    const VendorData = await Vendor.find({})
    if (VendorData) {
      res.json({status:true,VendorData})
    } else {
      res.json({status:false,VendorData})
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "Internal Server Error", status: false }); 
  }
}

const blockvendor = async (req, res) => {
  try {
    const { id } = req.query;
  
    console.log(req.query,"qqq");
  
    const block = await Vendor.updateOne({ _id: id }, { $set: { is_verified: false } })
    console.log(block,"llll");
    res.json({ status: true, alert: 'User blocked successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: 'Internal Server Error', status: false });
  }
};


const unblockvendor = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(req.query,"qqqw");
   
    const unblock = await Vendor.updateOne({ _id: id }, { $set: { is_verified: true } });
    console.log(unblock,"bbb");
    res.json({ status: true, alert: 'User unblocked successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: 'Internal Server Error', status: false });
  }
};


module.exports = {
  adminLogin,
  userList, 
  blockUser,
  unblockUser,
  vendorlist,
  blockvendor,
  unblockvendor
};
