// src/index.js
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');

const { httpServer } = require('http').createServer()
const mongoose = require('mongoose');
const { Schema } = require('mongoose')
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const { NEXT_PUBLIC_MONGO_URL } = process.env;

const connect = async () => {
  try {
    if (!NEXT_PUBLIC_MONGO_URL) {
      throw new Error("MongoDB URL is not defined.");
    }

    await mongoose.connect(NEXT_PUBLIC_MONGO_URL, {
      dbName: 'GIGA-CHAT'
    });
  } catch (error) {
    throw new Error("Error connecting to Mongoose");
  }
};



const OnlineUsers = new Schema({
  onlineUsers: {
    type: [String],
    required: true,
    unique: true
  }
})

const OnlineUser = mongoose.model("OnlineUser", OnlineUsers, "onlineUsers");

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const server = createServer(app)
// var io = require('socket.io')(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// }, { wsEngine: 'ws' });

// var server = require('http').createServer(app);
// var io = require('socket.io')(server, { wsEngine: 'ws' });

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})


let count = 0;
let rooms = {}

io.on('connection', (socket) => {
  console.log('a user connected', socket?.handshake?.auth?.token);
  try {
    socket.on('send_RoomId', (data) => {
      const { roomId, email, sender, receiver } = data;
      socket.broadcast.emit('check_RoomId', { room_Id: roomId, email, sender, receiver });
    });
    socket.on('online', (data) => {
      socket.broadcast.emit('onlineUsers', data);
    });
    socket.on('remove_online', (data) => {
      console.log('remove_online', data);
      socket.broadcast.emit('remove_online', data);
    })

    socket.on('new_user_message', (data) => {
      socket.broadcast.emit('is_new_user_message', data);
    })

    socket.on('voice_message', (data) => {
      console.log('voice_message', data)
      socket.to(data.roomId).emit('receive_voice_message', data)
    })

    socket.on('send_Message', (data) => {
      socket.to(data.room_Id).emit('receive_Message', {
        message: data.message,
        sender: data.user,
        profilePic: data.profilePic,
        email: data.email,
        roomId: data.room_Id,
      });
      console.log('current members in room', rooms[data.room_Id], 'message from', data.user, 'message', data.message)
      console.log(rooms)
    });

    socket.on('join_Room', (data) => {
      if (data) {
        const { room_Id, username } = data
        if (!rooms[room_Id]) {
          rooms[room_Id] = []
        }
        if (!rooms[room_Id].includes(username)) {
          rooms[room_Id].push(username);
          console.log(username, 'joined room', room_Id)
          socket.join(room_Id);
        }
        // rooms[room_Id].push(username);
        // console.log(username, 'joined room', room_Id)
        // socket.join(room_Id);
      }
    });

    socket.on('leave_Room', (data) => {
      const { room_Id, username } = data
      if(rooms[room_Id] === undefined) return
      rooms[room_Id] = rooms[room_Id].filter(user => user !== username)
      console.log(username, 'left room', room_Id)
      socket.leave(room_Id);
    })

    socket.on('disconnect', async () => {
      try {
        const username = socket?.handshake?.auth?.token
        console.log('username ', username)
        await connect()
        const user = await OnlineUser.findOne({});
        if (user?.onlineUsers?.length > 0) {
          user.onlineUsers = user.onlineUsers.filter(user => user !== username);
          await user.save();
        }
        socket.broadcast.emit('newOnlineUsers', { onlineUsers: user.onlineUsers });
        console.log('user disconnected', socket?.handshake?.auth?.token);
      } catch (e) { console.log(e) }
    });

  } catch (e) { console.log(e) }
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
