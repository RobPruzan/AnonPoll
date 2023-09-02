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
});

const activeRooms = new Map<string, Array<string>>();

io.on('connect', (socket) => {
  socket.on('create room', (roomID: string, acknowledge) => {
    activeRooms.set(roomID, []);
    acknowledge();
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
      console.log(
        'any actions that are connect',
        actions.filter((a) => a.type === 'connect')
      );
      acknowledge(actions);
    }
  );

  socket.on('action', (action: SocketAction) => {
    console.log('incoming action', action);
    if (action.type === 'connect') {
      return;
    }
    console.log('db entry for roomID:', action.meta.roomID);
    const res = prisma.action.create({
      data: {
        roomID: action.meta.roomID,
        serializedJSON: JSON.stringify(action),
      },
    });

    res.then((d) => {
      console.log('just saved the following to the db', d);
    });

    action.meta.fromServer = true;
    action.type === 'connect' && console.log('THIS IS BROKEN');
    console.log(
      'broadcasting this action to the room id',
      action,
      action.meta.roomID
    );
    socket.broadcast.to(action.meta.roomID).emit('shared action', action);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
