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
    // console.log(categoryData, "categoryData");
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

const getCategoryStudioList = async (req, res )=>{
  try {
    const {subCategory} = req.query
    console.log(req.query,"000");
    const studioIds = await Package.distinct("studioId", { subcategory: subCategory });
    // Populate the studios based on the found studioIds
    const studioData = await Studio.find({ "_id": { $in: studioIds } })
console.log(studioData,'fsdfsdfsa');
    res.json({status:true,studioData})
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
}

const getSingleStudio = async (req, res) => {
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
    console.log(req.body, "req.body");

    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];
    const decode = jwt.verify(token, process.env.USER_SECRET_KEY);
    console.log(decode);

    const newBooking = new Bookings({
      type: type,
      amount: booking,
      date: date,
      package: Id,
      studio: studioId,
      user:decode.userId
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

const getBookingDates = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(req.query, "lll");
    const bookingdates = await Bookings.find(
      { studio: id },
      { _id: 0, date: 1 }
    );
    console.log(bookingdates, "bookingdates");
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
    const { date } = req.query;
    const formatDate = new Date(date)
    console.log(formatDate,"formatDate");
    const isbookingDate = await Bookings.findOne({ date: formatDate });
    console.log(isbookingDate,"isbookingDate");
    if (isbookingDate) {
        res.json({status:false,alert:"not available on this date"}) 
    } else {
        res.json({status:true})
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
      console.log( req.body," req.body");
      const packageId = package._id;
      console.log(packageId,"11");
      const advanceAmount = (package.amount * (15 / 100)).toFixed(0)
  
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
        success_url: `http://localhost:5173/success?packageId=${packageId}`, // Include packageId in the URL
        cancel_url: "http://localhost:5173/cancel",
      });
  
      res.json({ id: session.id });
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };
  

const confirmPayment = async ( req, res ) =>{
    try {
        const { id } = req.query
        console.log(req.query,"id");
        //calculate wallet amount for vendor nd admin
        const booking = await Bookings.findOne({_id:id}).populate("studio")
console.log(booking,"booking");
        const advance = (booking.amount * (15 / 100)).toFixed(0); 
        console.log(advance,"advance");

        const AdminWallet = (advance*(5/100)).toFixed(0)
        console.log(AdminWallet,"AdminWallet");

        const vendorWallet = (advance-AdminWallet).toFixed(0)
        console.log(vendorWallet,"vendorWallet");

        const auth = req.headers.authorization;
        console.log(auth,"auth");
        const token = auth.split(" ")[1];
        const decode = jwt.verify(token, process.env.USER_SECRET_KEY);
        console.log(decode,"decodeUser");
        const confirm = await Bookings.updateOne({_id:id},{$set:{is_verified:true}})
        console.log(confirm,"confirm")
        const userBooking = await User.findOne({_id:decode.userId})
        userBooking.booking.push(id)
        userBooking.save()
        console.log(userBooking,"userBooking");
          //update wallet of vendor

          const updateVendorWallet = await Vendor.updateOne({ _id: booking.studio.vendorId },
            {
              $inc: { wallet: vendorWallet }, // Increment the wallet by the specified amount
              $push: {
                walletHistory: {
                  amount: vendorWallet,
                  date: new Date(),
                  from: userBooking.name
                },
              },
            })
            console.log(updateVendorWallet,"updateVendorWallet");
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: "Internal Server Error" }); 
    }
}

const getBookingdetails =async ( req, res ) => {
    try {
        const { id } = req.query
        console.log(req.query,"req.query");
        const bookingdetails = await User.findOne({ _id: id }).populate({
            path: 'booking',
            populate:[  
                {path: 'studio'},
                {path:"package"}
            ],
          });
          
        res.json({status:true,bookingdetails})
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: "Internal Server Error" }); 
    }
}

const getChatdetails = async (req, res ) => {
    try {
        const { id } = req.query
        const chatData = await Bookings.findOne({_id:id},{chat:1})
        res.json({status:true,chatData})
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: "Internal Server Error" });  
    }
}


const getSearchData = async (req, res ) => {
  console.log(777);
    try {
        const { data } = req.query
        console.log(data,"data");
        const regex = new RegExp(data,"i")
        const search = await Studio.find({
          $or:[
          {studioName:{$regex:regex}},
          {city:{$regex:regex}}
        ]
        })
        res.json({status:true,search})
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: "Internal Server Error" });  
    }
}


const postRating = async ( req, res ) => {
  try {
    const { packageId,rating } = req.body
    console.log( rating,"req.body");
    const studioId = await Bookings.findOne({_id:packageId}).populate("studio")
    console.log(studioId,"studioId");
    // const studio = await Studio.findOne({_id:packageId})
    studioId.studio.rating= rating
    studioId.studio.save()
    console.log(studioId,22);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

module.exports = {
  userRegister,
  securePassword,
  userLogin,
  addProfileImage,
  verifyUserOtp,
  resendUserOtp,
  getCategoryList,
  getStudioList,
  getCategoryStudioList,
  getSingleStudio,
  getStudioPackages,
  postBooking,
  getBookingDates,
  getIsBookedDate,
  paymentBooking,
  confirmPayment,
  getBookingdetails,
  getChatdetails,
  getSearchData,
  postRating
};
