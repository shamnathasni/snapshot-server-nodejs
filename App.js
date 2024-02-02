const express = require("express");
const App = express();
const CORS = require("cors");
const http = require("http");
const socketSetup = require("./chat/socket");

const io = socketSetup();

require("dotenv").config();
const PORT = process.env.PORT || 3000;

const dbConnection = require("./Config/Configurationdb");

dbConnection();
App.use(cors({
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}))
// App.use(CORS({
//   origin:"https://snapshot-studios.vercel.app",  
//   credentials:true
// }))
// App.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*")
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
//   next() 
//   })

App.use(express.json());
App.use(express.urlencoded({ extended: true }));

const userRoute = require("./Routes/userRoute");
App.use("/", userRoute);

const adminRoute = require("./Routes/adminRoute");
App.use("/admin", adminRoute);

const vendorRoute = require("./Routes/vendorRoute");
App.use("/vendor", vendorRoute);

App.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
