import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = require('http').createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    // credentials: true
  },
});
type Meta = {
  userID: string;
  playgroundID: string;
  fromServer?: boolean;
  scaleFactor?: number;
};
type Polls = {};
type Data = {
  polls: [];
};

io.on('connect', (socket) => {
  socket.on('join room', (roomID: string, userID: string, acknowledge) => {
    socket.join(roomID);
    socket.emit('send user data', socket.id);
    console.log('User joined room, user id is:', socket.id);
    acknowledge(roomID);
  });

  socket.on('sent user data', (data: Data, socketID, acknowledge) => {
    io.to(socketID).emit(JSON.stringify(data));
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
