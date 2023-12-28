const User = require("../Model/userModel");
const Otp = require("../Model/OtpModel");
const Category = require("../Model/categoryModel");
const Studio = require("../Model/studioModel");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const studio = require("../Model/studioModel");
const Bookings = require("../Model/bookingModel");
require("dotenv").config();

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//otp///

var email;
const generateOtp = () => {
  var otp = Math.random();
  otp = otp * 1000000;
  otp = parseInt(otp);
  console.log(otp, "og");
  return otp;
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",
  auth: {
    user: "shamnathasni4@gmail.com",
    pass: process.env.APP_PASSWORD,
  },
});

const userRegister = async (req, res) => {
  try {
    const { name, number, email, password } = req.body;
    console.log(req.body);
    const emailExist = await User.findOne({ email: email });
    console.log(emailExist + "email");

    if (emailExist) {
      res.json({ alert: "email already exists", status: false });
    } else {
      const otp = generateOtp();
      const mailOption = {
        from: "shamnathasni4@gmail.com",
        to: req.body.email,
        subject: "OTP VERIFICATION",
        html:
          "<h3>OTP for account verification is </h3>" +
          "<h1 style='font-weight:bold;'>" +
          otp +
          "</h1>",
      };
      transporter.sendMail(mailOption);
      console.log("otp send");
      const newOtp = new Otp({
        email,
        otp,
      });
      newOtp.save();
    }
    res.json({ alert: "otp send into your email", status: true });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({ alert: "internal server error", status: false });
  }
};

const verifyUserOtp = async (req, res) => {
  try {
    const { otp, userData } = req.body;
    console.log(req.body.userData, "uuuuu");
    console.log(req.body.otp, "voo");
    const existOtp = await Otp.findOne({ email: userData.email, otp });
    console.log(existOtp, "exot");
    const sPassword = await securePassword(userData.password);
    console.log(otp, "otp");
    console.log(existOtp);
    if (existOtp && otp == existOtp.otp) {
      const user = new User({
        name: userData.name,
        number: userData.number,
        email: userData.email,
        password: sPassword,
        is_verified: true,
      });
      const newUser = await user.save(); // Wait for the save operation
      if (newUser) {
        const token = jwt.sign(
          { userId: newUser._id },
          process.env.USER_SECRET_KEY
        );
        res.json({
          newUser,
          alert: "You have successfully signed up!",
          status: true,
          token,
        });
      } else {
        res.json({ alert: "registration failed", status: false });
      }
    } else {
      res.status(200).json({ alert: "otp verification failed" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "internal server error", status: false });
  }
};

const resendUserOtp = async (req, res) => {
  try {
    console.log(111);
    const { userData } = req.body;
    const otp = generateOtp();
    console.log(otp, "ooo");
    const newOtp = await Otp.updateOne({ email: userData.email, otp });
    const resendOTP = await Otp.findOne({ otp });
    console.log(resendOTP, "rres");
    console.log(newOtp, "nnn");
    const mailOption = {
      from: "shamnathasni4@gmail.com",
      to: userData.email,
      subject: "OTP RESENDED",
      html:
        "<h3>OTP for account verification is </h3>" +
        "<h1 style='font-weight:bold;'>" +
        resendOTP.otp +
        "</h1>",
    };
    transporter.sendMail(mailOption);
    res.status(200).json({ alert: "otp resend", status: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "internal server error", status: false });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body + "body");
    const emailExist = await User.findOne({ email: email, is_verified: true });
    if (emailExist) {
      const access = await bcrypt.compare(password, emailExist.password);
      if (access) {
        const token = jwt.sign(
          { userId: emailExist._id },
          process.env.USER_SECRET_KEY
        );

        res.json({
          newUser: emailExist,
          alert: "You have successfully signed in!",
          token,
          status: true,
        });
      } else {
        res.status(200).json({ alert: "password is incorrect", status: false });
      }
    } else {
      res
        .status(200)
        .json({ alert: "No Account with this Email", status: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ alert: "internal server error", status: false });
  }
};

const addProfileImage = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];
    const decode = jwt.verify(token, process.env.USER_SECRET_KEY);
    console.log(decode);

    const { image } = req.body;
    // Use async/await for the update operation
    const updatedUser = await User.findOneAndUpdate(
      { _id: decode.userId },
      { $set: { image: image } },
      { new: true }
    );

    if (updatedUser) {
      res.json({ updated: true, data: updatedUser });
    } else {
      res.json({ updated: false, data: null, message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const getCategoryList = async (req, res) => {
  try {
    const categoryData = await Category.find({ is_Verified: true }).populate(
      "subcategory"
    );
    console.log(categoryData, "categoryData");
    res.json({ status: true, categoryData });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const getStudioList = async (req, res) => {
  try {
    const studioData = await studio.find({}).populate("package");
    console.log(studioData, "studioData");
    res.json({ status: true, studioData });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const getSinglStudio = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(req.query, "req.body");
    const singleStudio = await Studio.findOne({ _id: id }).populate("package");
    res.json({ status: true, singleStudio });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const postBooking = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];

    // Verify the token to get the vendorId
    const decodedToken = jwt.verify(token, process.env.VENDOR_SECRET_KEY);

    const vendorId = decodedToken.vendorId;
    const studio = await Studio.findOne({ vendorId: vendorId });

    const { booking, type, date, Id } = req.body;
    console.log(req.body, "req.body");
    const newBooking = new Bookings({
      type: type,
      amount: booking,
      date: date,
      package: Id,
      studio: studio._id,
    });
    console.log(newBooking, "newBooking");
    const bookingData = await newBooking.save();
    res
      .status(200)
      .json({ status: true, alert: "make your advance payment", bookingData });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

module.exports = {
  userRegister,
  securePassword,
  userLogin,
  addProfileImage,
  verifyUserOtp,
  resendUserOtp,
  getCategoryList,
  getStudioList,
  getSinglStudio,
  postBooking,
};
