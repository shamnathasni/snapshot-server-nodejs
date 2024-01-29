const User = require("../Model/userModel");
const Otp = require("../Model/OtpModel");
const Category = require("../Model/categoryModel");
const Studio = require("../Model/studioModel");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const studio = require("../Model/studioModel");
const Package = require("../Model/packageModel");
const Bookings = require("../Model/bookingModel");
const Admin = require("../Model/adminModel");
const Vendor = require("../Model/vendorModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
    const emailExist = await User.findOne({ email: email });
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
    const existOtp = await Otp.findOne({ email: userData.email, otp });
    const sPassword = await securePassword(userData.password);
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
          process.env.USER_SECRET_KEY,
          { expiresIn: "1d" }
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
    const { userData } = req.body;
    const otp = generateOtp();
    const newOtp = await Otp.updateOne({ email: userData.email, otp });
    const resendOTP = await Otp.findOne({ otp });
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
    const emailExist = await User.findOne({ email: email, is_verified: true });
    if (emailExist) {
      const access = await bcrypt.compare(password, emailExist.password);
      if (access) {
        const token = jwt.sign(
          { userId: emailExist._id },
          process.env.USER_SECRET_KEY,
          { expiresIn: "1d" }
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

const googleAuth = async (req, res) => {
  try {
    const { email, displayName, photoURL } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      const token = jwt.sign(
        { userId: user._id },
        process.env.USER_SECRET_KEY,
        { expiresIn: "1d" }
      );
      const { password, ...userData } = user._doc;

      res.status(200).json({ user: userData, token });
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await securePassword(generatedPassword);

      const newUser = new User({
        name:
          displayName.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: email,
        password: hashedPassword,
        profileImage: photoURL,
        isEmailVerified: true,
      });

      await newUser.save();

      const token = jwt.sign(
        { userId: newUser._id },
        process.env.USER_SECRET_KEY
      );
      const { password, ...userData } = newUser._doc;

      return res
        .status(200)
        .json({ user: userData, message: "User created successfully." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addProfileImage = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];
    const decode = jwt.verify(token, process.env.USER_SECRET_KEY);

    const { image } = req.body;
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
    res.json({ status: true, studioData });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const getCategoryStudioList = async (req, res) => {
  try {
    const { subCategory } = req.query;
    const studioIds = await Package.distinct("studioId", {
      subcategory: subCategory,
    });
    // Populate the studios based on the found studioIds
    const studioData = await Studio.find({ _id: { $in: studioIds } });
    res.json({ status: true, studioData });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const getSingleStudio = async (req, res) => {
  try {
    const { id } = req.query;
    const singleStudio = await Studio.findOne({ _id: id }).populate("package");
    res.json({ status: true, singleStudio });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const getStudioPackages = async (req, res) => {
  try {
    const { id } = req.query;
    const packages = await Package.find({ studioId: id });
    res.json({ status: true, packages });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const postBooking = async (req, res) => {
  try {
    const { booking, type, date, Id, studioId } = req.body;
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];
    const decode = jwt.verify(token, process.env.USER_SECRET_KEY);

    const newBooking = new Bookings({
      type: type,
      amount: booking,
      date: date,
      package: Id,
      studio: studioId,
      user: decode.userId,
    });
    const bookingDetails = await newBooking.save();
    const updateBookingInUser = await User.updateOne(
      { _id: decode.userId },
      { $push: { booking: bookingDetails._id } }
    );
    const bookedUsera = await User.findOne({ _id: decode.userId });
    res.json({
      status: true,
      alert:
        "wait for the approval of studio,then after the completion of payment you can confirm your booking",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const postPaymentDetails = async (req, res) => {
  try {
    const { bookingId } = req.query;
    const booking = await Bookings.findOne({ _id: bookingId });
    res.json({ status: true, booking });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const getBookingDates = async (req, res) => {
  try {
    const { studioId, subcategory } = req.body;
    const bookingdates = await Bookings.find(
      { studio: studioId, is_verified: true },
      { _id: 0, date: 1 }
    ).populate("package");
    res.json({ status: 200, bookingdates });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const getIsBookedDate = async (req, res) => {
  try {
    const { formattedDate, studioId, subcategory } = req.body;
    const formatDate = new Date(formattedDate);

    const isbookingDate = await Bookings.findOne({
      studio: studioId,
      date: formatDate,
      "package.subcategory": subcategory,
    }).populate("package");
    if (isbookingDate) {
      res.json({ status: false, alert: "not available on this date" });
    } else {
      res.json({ status: true });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const paymentBooking = async (req, res) => {
  try {
    const { package } = req.body;
    const packageId = package._id;
    const advanceAmount = (package.amount * (15 / 100)).toFixed(0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Amount",
            },
            unit_amount: advanceAmount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://snapshot-studios.vercel.app/success?packageId=${packageId}`, // Include packageId in the URL
      cancel_url: "https://snapshot-studios.vercel.app/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { id } = req.query;
    const booking = await Bookings.findOne({ _id: id }).populate("studio");
    const advance = (booking.amount * (15 / 100)).toFixed(0);

    const AdminWallet = (advance * (5 / 100)).toFixed(0);

    const vendorWallet = (advance - AdminWallet).toFixed(0);

    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];
    const decode = jwt.verify(token, process.env.USER_SECRET_KEY);
    const confirm = await Bookings.updateOne(
      { _id: id },
      { $set: { is_verified: true } }
    );
    const userBooking = await User.findOne({ _id: decode.userId });
    userBooking.booking.push(id);
    userBooking.save();

    const updateVendorWallet = await Vendor.updateOne(
      { _id: booking.studio.vendorId },
      {
        $inc: { wallet: vendorWallet }, // Increment the wallet by the specified amount
        $push: {
          walletHistory: {
            amount: vendorWallet,
            date: new Date(),
            from: userBooking.name,
          },
        },
      }
    );

    const updateAdminWallet = await Admin.updateOne(
      { email:"Admin@gmail.com"},
      {
        $inc: { wallet: vendorWallet }, // Increment the wallet by the specified amount
        $push: {
          walletHistory: {
            amount: AdminWallet,
            date: new Date(),
            from: userBooking.name,
          },
        },
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const getBookingdetails = async (req, res) => {
  try {
    const { id } = req.query;
    const bookingdetails = await User.findOne({ _id: id }).populate({
      path: "booking",
      populate: [{ path: "studio" }, { path: "package" }],
    });

    res.json({ status: true, bookingdetails });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const getChatdetails = async (req, res) => {
  try {
    const { id } = req.query;
    const chatData = await Bookings.findOne({ _id: id }, { chat: 1 });
    res.json({ status: true, chatData });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const getSearchData = async (req, res) => {
  try {
    const { data } = req.query;
    const regex = new RegExp(data, "i");
    const search = await Studio.find({
      $or: [{ studioName: { $regex: regex } }, { city: { $regex: regex } }],
    });
    res.json({ status: true, search });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const postRating = async (req, res) => {
  try {
    const { packageId, rating } = req.body;

    const studioId = await Bookings.findOne({ _id: packageId }).populate(
      "studio"
    );

    if (!studioId) {
      return res.status(404).send({ error: "Studio not found" });
    }

    // Ensure the rating field in Studio model schema is an array
    studioId.studio.rating.push(rating);
    await studioId.studio.save();

    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = {
  userRegister,
  securePassword,
  userLogin,
  addProfileImage,
  verifyUserOtp,
  resendUserOtp,
  googleAuth,
  getCategoryList,
  getStudioList,
  getCategoryStudioList,
  getSingleStudio,
  getStudioPackages,
  postBooking,
  postPaymentDetails,
  getBookingDates,
  getIsBookedDate,
  paymentBooking,
  confirmPayment,
  getBookingdetails,
  getChatdetails,
  getSearchData,
  postRating,
};
