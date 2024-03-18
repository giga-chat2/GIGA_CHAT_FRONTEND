// src/index.js
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

let count = 0;

io.on('connection', (socket) => {
  socket.on('sendRoomId', (data) => {
    const { roomId, email, sender, receiver } = data;
    socket.broadcast.emit('checkRoomId', { room_Id: roomId, email, sender, receiver });
  });

  socket.on('sendMessage', (data) => {
    socket.to(data.room_Id).emit('receiveMessage', {
      message: data.message,
      sender: data.user,
      profilePic: data.profilePic,
      email: data.email,
    });
  });

  socket.on('joinRoom', (data) => {
    socket.join(data);
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
