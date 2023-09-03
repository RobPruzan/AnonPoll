import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  Answer,
  ConnectAck,
  FirstParameter,
  Meta,
  Poll,
  Question,
  Room,
  SecondParameter,
  SocketAction,
} from '../../shared/types';

import { prisma } from '../../shared/prisma';
import { Socket } from 'socket.io-client';

const app = express();
app.use(cors());

const server = require('http').createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    // credentials: true
  },
  maxHttpBufferSize: 1e8,
});

const activeRooms = new Map<string, Array<string>>();

io.on('connect', (socket) => {
  // console.log('Connected');
  socket.on('create room', (roomID: string, acknowledge) => {
    console.log('attempted room create');
    activeRooms.set(roomID, []);
    // acknowledge();
  });
  socket.on(
    'join room',
    async (roomID: string, userID: string, acknowledge: ConnectAck) => {
      if (!activeRooms.get(roomID)) {
        acknowledge('error');
      }
      socket.join(roomID);
      const currentRoom = activeRooms.get(roomID);
      const newRoom = [...(currentRoom ?? []), userID];
      activeRooms.set(roomID, newRoom);
      socket.emit('send user data', socket.id);
      const actions = await (
        await prisma.action.findMany({
          where: {
            roomID: roomID,
          },
        })
      ).map((sAction) => JSON.parse(sAction.serializedJSON) as SocketAction);
      console.log('searched for room id', roomID);
      console.log('sending over the following actions', actions);
      acknowledge(actions);
    }
  );

  socket.on('action', async (action: SocketAction) => {
    if (action.type === 'connect' || action.type === 'join') {
      return;
    }

    const res = await prisma.action.create({
      data: {
        roomID: action.meta.roomID,
        serializedJSON: JSON.stringify(action),
      },
    });

    action.meta.fromServer = true;

    socket.broadcast
      .to(action.meta.roomID)
      .emit('shared action', JSON.parse(res.serializedJSON));
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
