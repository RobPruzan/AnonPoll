export type Meta = {
  userID: string | null;
  pollID: string | null;
  fromServer?: boolean;
};
export type SocketAction = { type: string; payload: any; meta: Meta };
