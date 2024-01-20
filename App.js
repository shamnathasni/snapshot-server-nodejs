const express = require("express");
const App = express();
const CORS = require("cors")
const http = require("http");
const socketSetup = require("./chat/socket")

// const server = http.createServer(App);
const io = socketSetup();


require("dotenv").config();
const PORT = process.env.PORT||3000;

const dbConnection = require("./Config/Configurationdb")

dbConnection()

App.use(express.json())
App.use(express.urlencoded({extended:true}))
App.use(CORS({
  origin: "https://snapshot-studios.vercel.app",
  credentials: true, // Include credentials in the CORS request (if needed)
}));

const userRoute = require("./Routes/userRoute")
App.use("/",userRoute)

const adminRoute = require("./Routes/adminRoute")
App.use("/admin",adminRoute)

const vendorRoute = require("./Routes/vendorRoute")
App.use("/vendor",vendorRoute)

App.listen(PORT,()=>{
    console.log(` server is running on http://localhost:${PORT}`);
})