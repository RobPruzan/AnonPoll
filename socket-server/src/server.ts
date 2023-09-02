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

const activeRooms = new BetterMap<string, Room>();

io.on('connect', (socket) => {
  socket.on(
    'join room',
    (roomID: string, userID: string, acknowledge: ConnectAck) => {
      activeRooms.setIfAbsent(
        roomID,
        {
          code: roomID,
          polls: [],
          user_ids: [userID],
        },
        (existingVal) => {
          existingVal.user_ids.push(userID);
        }
      );
      socket.join(roomID);
      socket.emit('send user data', socket.id);
      console.log('User joined room, user id is:', socket.id);
      activeRooms.getAndThen(roomID, (value) => {
        acknowledge(value);
      });
    }
  );

  // socket.on('sent user data', (data: Data, socketID, acknowledge) => {
  //   io.to(socketID).emit(JSON.stringify(data));
  // });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
