const Vendor = require("../Model/vendorModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const vendor = require("../Model/vendorModel");
const Studio = require("../Model/studioModel");
const Category = require("../Model/categoryModel");
const subcategory = require("../Model/subCategory");
const Package = require("../Model/packageModel");
const Booking = require("../Model/bookingModel");
require("dotenv").config();

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const vendorRegister = async (req, res) => {
  try {
    const { name, number, email, password } = req.body;

    const sPassword = await securePassword(password); // Wait for the hashed password
    const emailExist = await Vendor.findOne({ email: email });

    if (emailExist) {
      return res.json({ alert: "Email already exists", status: false });
    }

    const vendor = new Vendor({
      name,
      number,
      email,
      password: sPassword,
      is_verified: true,
    });

    const newVendor = await vendor.save(); // Wait for the save operation

    if (newVendor) {
      const token = jwt.sign(
        { vendorId: newVendor._id },
        process.env.VENDOR_SECRET_KEY,
        { expiresIn: "1d" }
      );
      return res.json({
        newVendor,
        alert: "Welcome, Vendor! You have successfully signed up.",
        status: true,
        token,
      });
    }

    return res.json({ alert: "Registration failed", status: false });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ alert: "Internal server error", status: false });
  }
};

const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailExist = await Vendor.findOne({
      email: email,
      is_verified: true,
    });
    if (emailExist) {
      const access = await bcrypt.compare(password, emailExist.password);
      if (access) {
        const token = jwt.sign(
          { vendorId: emailExist._id },
          process.env.VENDOR_SECRET_KEY,
          { expiresIn: "1d" }
        );

        res.json({
          newVendor: emailExist,
          alert: "Welcome, Vendor! You have successfully signed in.",
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
    const id = req.body.vendorId;

    const image = req.file.filename;
    // Use async/await for the update operation
    const updatedVendor = await Vendor.findOneAndUpdate(
      { _id: id },
      { $set: { image: image } },
      { new: true }
    );

    if (updatedVendor) {
      res.json({ updated: true, data: updatedVendor });
    } else {
      res.json({ updated: false, data: null, message: "vendor not found" });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const vendorStudio = async (req, res) => {
  try {
    const { id } = req.query;

    const studio = await Studio.findOne({ vendorId: id }).populate("package");
    const studio1 = await Vendor.findOne({ _id: id });

    if (studio) {
      res.status(200).json({ status: true, studio });
    } else {
      res.status(200).json({ status: false });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const postStudioForm = async (req, res) => {
  try {
    const { studioName, city, about, coverImage, galleryImage, vendorId } =
      req.body;
    const existStudio = await Studio.findOne({ vendorId: vendorId });

    if (existStudio) {
      res.json({ alert: "Studio already added", status: false });
    } else {
      const createdStudio = await Studio({
        studioName,
        vendorId,
        city,
        about,
        coverImage,
        galleryImage,
      });
      const newStudio = createdStudio.save();
      res.json({ alert: "studio added", status: true });

    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const postvendorCategory = async (req, res) => {
  try {
    const vendorCategory = await Category.find({}).populate("subcategory");

    res.json({ status: true, vendorCategory });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const uploadStudioImage = async (req, res) => {
  try {
    const { image, studioId } = req.body;
    console.log(req.body, "rr");
    const studio = await Studio.findOne({ _id: studioId }); // Fix the typo here
    studio.galleryImage.push(image);
    studio.save();
    res.json({ status: true });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const getPackageList = async (req, res) => {
  try {
    const { vendorId } = req.query;
    const studio = await Studio.findOne({ vendorId: vendorId });
    const packageData = await Package.find({ studioId: studio._id });
    res.json({ status: true, packageData });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const postaddPackage = async (req, res) => {
  try {
    const { localState, vendorsId } = req.body;

    const studio = await Studio.findOne({ vendorId: vendorsId });

    const existCategory = await Package.findOne({
      studioId: studio._id,
      subcategory: localState.localState.subCategoryName,
    });

    if (existCategory) {
      res.json({
        alert: "package already exist for this subcategory",
        status: false,
      });
    } else {
      const package = new Package({
        subcategory: localState.localState.subCategoryName,
        camera: localState.localState.camera,
        video: localState.localState.video,
        both: localState.localState.both,
      });

      const newStudio = await Studio.findOne({ vendorId: vendorsId });

      if (newStudio) {
        newStudio.package.push(package._id);
        const newStudioPackage = await newStudio.save();

        package.studioId = newStudio._id;
        const newPackage = await package.save();

        res.json({ alert: "new package added", status: true, newPackage });
      }
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const bookingDetails = async (req, res) => {
  try {
    const { Id } = req.query;
    const studio = await Studio.findOne({ vendorId: Id });
    const bookings = await Booking.find({ studio: studio._id })
      .sort({ createdAt: -1 })
      .populate("package")
      .populate("studio");
    res.json({ status: true, bookings, alert: "booking confirm by you" });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.query;
    const confirmBoooking = await Booking.updateOne(
      { _id: bookingId },
      { $set: { status: "confirm" } }
    );
    res.json({ status: true });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const RejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.query;
    const rejectBoooking = await Booking.updateOne(
      { _id: bookingId },
      { $set: { status: "reject" } }
    );
    res.json({ status: false });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

const vendorChat = async (req, res) => {
  try {
    const { Id } = req.query;
    const chat = await Booking.findOne({ _id: Id }, { chat: 1 }).populate(
      "user"
    );

    res.json({ status: true, chat });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ updated: false, data: null, message: "Internal server error" });
  }
};

module.exports = {
  vendorRegister,
  securePassword,
  vendorLogin,
  addProfileImage,
  vendorStudio,
  postStudioForm,
  uploadStudioImage,
  postvendorCategory,
  getPackageList,
  postaddPackage,
  bookingDetails,
  confirmBooking,
  RejectBooking,
  vendorChat,
};
