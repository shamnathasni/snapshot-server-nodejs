const User = require("../Model/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require("dotenv").config()


const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch ( error ) {
        console.log(error.message);
    }
}

const userRegister = async (req, res) => {
    try {
        const { name, number, email, password } = req.body;
        console.log(req.body);
        const sPassword = await securePassword(password); // Wait for the hashed password
        const emailExist = await User.findOne({ email: email });
        console.log(emailExist+"email")
        
        if (emailExist) {
            res.json({ alert: "email already exists", status: false });
        } else {
            const user = new User({
                name,
                number,
                email,
                password: sPassword,
                is_verified: true,
            });
            
            const newUser = await user.save(); // Wait for the save operation
            console.log(newUser+"newuser");
            if (newUser) {
                const token = jwt.sign({ userId: newUser._id }, process.env.USER_SECRET_KEY, {
                    expiresIn: "1h",
                });
                res.json({ newUser, alert: "registered", status: true, token });
            } else {
                res.json({ alert: "registration failed", status: false });
            }
        }
    } catch (error) {
        console.log(error.message);
        
        res.status(500).json({ alert: "internal server error", status: false });
    }
};


const userLogin = async (req, res ) => {
    try {
        const{ email, password } = req.body
        console.log( req.body+"body");
        const emailExist = await User.findOne({email:email})
        if (emailExist) {
            const access = await bcrypt.compare( password, emailExist.password) 
            if(access){
                const token = jwt.sign(
                    {userId:emailExist._id},
                    process.env.USER_SECRET_KEY,
                    {expiresIn:"1h"}
                    )
            
            res.json({ newUser: emailExist, token, status: true });
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
      const id = req.body.userId;
      const image = req.file.filename;
      
      // Use async/await for the update operation
      const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        { $set: { image: image } },
        { new: true }
      );
  console.log(updatedUser+"uuuuu");
      if (updatedUser) {
        res.json({ updated: true, data: updatedUser });
      } else {
        res.json({ updated: false, data: null, message: "User not found" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ updated: false, data: null, message: "Internal server error" });
    }
  };
  
  module.exports = {
    userRegister,
    securePassword,
    userLogin,
    addProfileImage,
  };
  
module.exports={
    userRegister,
    securePassword,
    userLogin,
    addProfileImage
}