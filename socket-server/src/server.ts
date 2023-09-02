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

class BetterMap<TKey, TValue> extends Map<TKey, TValue> {
  getOrElse<TElse>(k: TKey, elseCB: () => TElse): TValue | TElse {
    const value = this.get(k);

    if (value === undefined) {
      return elseCB();
    }

    return value;
  }

  getAndThen<TElse>(k: TKey, thenCB: (v: TValue) => TElse): TElse | null {
    const value = this.get(k);

    if (value === undefined) {
      return null;
    }

    return thenCB(value);
  }

  setIfAbsent(k: TKey, v: TValue, elseCB: (existingVal: TValue) => unknown) {
    const val = this.get(k);
    if (val === undefined) {
      this.set(k, v);
      return;
    }

    elseCB(val);
  }
}

// const activeRooms = new BetterMap<string, Room>();

io.on('connect', (socket) => {
  socket.on(
    'join room',
    async (roomID: string, userID: string, acknowledge: ConnectAck) => {
      // activeRooms.setIfAbsent(
      //   roomID,
      //   {
      //     roomID: roomID,
      //     polls: [],
      //     user_ids: [userID],
      //   },
      //   (existingVal) => {
      //     existingVal.user_ids.push(userID);
      //   }
      // );
      socket.join(roomID);
      socket.emit('send user data', socket.id);
      const actions = await prisma.action.findMany();
      acknowledge(actions);
      console.log('User joined room, user id is:', socket.id);
      // activeRooms.getAndThen(roomID, (value) => {
      //   acknowledge(value);
      // });
    }
  );

  socket.on('action', (action: SocketAction) => {
    console.log('emitting the following action', action);
    prisma.action.create({
      data: {
        serializedJSON: JSON.stringify(action),
      },
    });
    // action.meta.fromServer = true;
    socket.broadcast.to(action.meta.roomID).emit('shared action', action);
  });

  socket.on('transfer over data', (room: Room) => {
    socket.emit('sync with master', room);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
