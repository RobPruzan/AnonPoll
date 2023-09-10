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
const activeSocketsInRooms = new Map<string, Array<string>>();
const pendingSockets = new Map<string, Array<string>>();

io.on('connect', (socket) => {
  console.log('CONNECTEDD');
  const query = socket.handshake.query;
  const pendingRoomID = query.pendingRoomID as string | undefined;

  if (pendingRoomID) {
    socket.join(pendingRoomID);
  }

  socket.on('create room', (roomID: string, acknowledge) => {
    activeRooms.set(roomID, []);
    activeSocketsInRooms.set(roomID, []);
    acknowledge();
  });
  socket.on('leave', (roomID: string, userID: string) => {
    socket.leave(roomID);
    const room = activeRooms.get(roomID);
    const socketRoom = activeSocketsInRooms.get(roomID) ?? [];
    activeSocketsInRooms.set(
      roomID,
      socketRoom.filter((sID) => sID !== socket.id)
    );
    if (room) {
      activeRooms.set(
        roomID,
        room.filter((p) => p !== userID)
      );
    }
  });
  socket.on('join room', async (roomID: string, userID: string, ack) => {
    const sockets = activeSocketsInRooms.get(roomID) ?? [];
    if (sockets.some((s) => s === socket.id)) {
      return;
    }
    socket.join(roomID);
    const currentRoom = activeRooms.get(roomID);
    const newRoom = [...(currentRoom ?? []), userID];
    pendingSockets.set(
      roomID,
      (pendingSockets.get(roomID) ?? []).filter((sID) => sID !== socket.id)
    );
    activeRooms.set(roomID, newRoom);

    ack();
  });
  socket.on('disconnect', (roomID?: string) => {
    socket.leave(roomID);
    socket.removeAllListeners();
  });
  socket.on('action', async (action: SocketAction) => {
    if (action.type === 'connect' || action.type === 'join') {
      return;
    }

    prisma.action
      .create({
        data: {
          roomID: action.meta.roomID,
          serializedJSON: JSON.stringify(action),
        },
      })
      // do not remove this .then the app will literally break
      .then((d) => {});

    action.meta.fromServer = true;
    socket.broadcast.to(action.meta.roomID).emit('shared action', action);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
