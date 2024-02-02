// socket.js
const socketIO = require("socket.io");
const http = require("http");
const cors = require("cors");

const Bookings = require("../Model/bookingModel");

module.exports = () => {
  const server = http.createServer();

  const io = socketIO(server, {
    cors: {
      // origin: "https://snapshot-studios.vercel.app",
      methods: ["GET", "POST","PUT","PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("join-chat", (data) => {
      socket.join(data.bookingId);
    });

    // Listens and logs the message to the console
    socket.on("sendMessage", async (data) => {
     
      try {
    
        const result = await Bookings.updateOne(
          { _id: data.chatId },
          {
            $push: {
              chat: {
                from: data.from,
                message: data.message,
              },
            },
          }
         );
       
      } catch (error) {
        console.log(error.message);
      }

      io.to(data.chatId).emit("messageResponse", data);
   
    });

    socket.on("disconnect", () => {
      console.log(`🔥: User ${socket.id} disconnected`);
    });
  });

  const PORT = process.env.SOCKET_PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Socket.IO server listening on port ${PORT}`);
  });

  return io;
};
