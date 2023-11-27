const Vendor = require("../Model/vendorModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const vendor = require("../Model/vendorModel")
require("dotenv").config()


const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch ( error ) {
        console.log(error.message);
    }
}

const vendorRegister = async (req, res) => {
    try {
        const { name, number, email, password } = req.body;
        console.log(req.body+"body");
        const sPassword = await securePassword(password); // Wait for the hashed password
        const emailExist = await Vendor.findOne({ email: email });
        console.log(emailExist+"email")
        
        if (emailExist) {
            res.json({ alert: "email already exists", status: false });
        } else {
            const vendor = new Vendor({
                name,
                number,
                email,
                password: sPassword,
                is_verified: true,
            });
            
            const newVendor = await vendor.save(); // Wait for the save operation
            console.log(newVendor+"newVendor");
            if (newVendor) {
                const token = jwt.sign({ vendorId: newVendor._id }, process.env.VENDOR_SECRET_KEY, {
                    expiresIn: "1h",
                });
                res.json({ newVendor, alert: "registered", status: true, token });
            } else {
                res.json({ alert: "registration failed", status: false });
            }
        }
    } catch (error) {
        console.log(error.message);
        
        res.status(500).json({ alert: "internal server error", status: false });
    }
};

const vendorLogin =async(req, res)=>{
    try {
        const{ email, password } = req.body
        console.log( req.body+"body");
        const emailExist = await Vendor.findOne({email:email})
        if (emailExist) {
            const access = await bcrypt.compare( password, emailExist.password) 
            if(access){
                const token = jwt.sign(
                    {vendorId:emailExist._id},
                    process.env.VENDOR_SECRET_KEY,
                    {expiresIn:"1h"}
                    )
            
            res.json({ newVendor: emailExist, token, status: true });
            } else {
                res.status(200).json({alert:"password is incorrect",status:false})
            }
        }else{
            res.status(200).json({alert:"No Account with this Email",status:false})
        }
    } catch (error) {
        console.log(error.message);
        
        res.status(500).json({ alert: "internal server error", status: false });  
    }
}

const addProfileImage = async (req, res) => {
    try {
        console.log("opjphiph");
      const id = req.body.vendorId;
      console.log(id,"id");
      const image = req.file.filename;
      // Use async/await for the update operation
      const updatedVendor = await Vendor.findOneAndUpdate(
        { _id: id },
        { $set: { image: image } },
        { new: true }
      );
  console.log(updatedVendor+"uuuuu");
      if (updatedVendor) {
        res.json({ updated: true, data: updatedVendor });
      } else {
        res.json({ updated: false, data: null, message: "vendor not found" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ updated: false, data: null, message: "Internal server error" });
    }
  };

module.exports={
    vendorRegister,
    securePassword,
    vendorLogin,
    addProfileImage
}