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
  // const userID = query.userID as string | undefined;

  // pendingSockets.set(pendingRoomID, []);
  // pendingSockets.get(pendingRoomID).push(socket.id);

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

    // const newJoiningUsers = joiningUsers.filter(
    //   (socketID) => socketToUser.get(socketID) !== socketToUser.get(socket.id)
    // );
    // pendingUserRoomJoins.set(roomID, newJoiningUsers);
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
    // this doesn't handle the disconnect
    // const socketsIds = pendingSockets.get(action.meta.roomID) ?? [];

    // const connectedSocket = await io.in(action.meta.roomID).fetchSockets();
    // console.log('a', socketsIds);
    // console.log(
    //   'b',
    //   connectedSocket.map((socket) => socket.id)
    // );
    // const connectedSocketIds = connectedSocket.map((socket) => socket.id);
    // const allSocketIds = [
    //   ...new Set(connectedSocketIds.concat(socketsIds)).keys(),
    // ];
    // console.log('all ids', allSocketIds);
    // allSocketIds.forEach((sID) => {
    //   socket.broadcast.to(sID).emit('shared action', action);
    // });
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
