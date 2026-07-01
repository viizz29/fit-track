// socket.ts
import { BACKEND_SERVER, SOCKETIO_ENDPOINT } from "@/config";
import { io, Socket } from "socket.io-client";

type SocketEventMap = {
  new_message: { roomId: string; content: { type: string; content: any } };
  message_delivered: { messageId: number };
  message_read: { messageId: number; readAt: string };
};

type Listener<K extends keyof SocketEventMap> = (
  payload: SocketEventMap[K],
) => void;

type ListenerMap = {
  [K in keyof SocketEventMap]?: Listener<K>[];
};
export class SocketConnection {
  private socket: Socket | null = null;

  private listeners: ListenerMap = {};

  constructor() {}

  addEventListener<K extends keyof SocketEventMap>(
    event: K,
    listener: Listener<K>,
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event]!.push(listener);

    return () => this.removeEventListener(event, listener);
  }

  private removeEventListener<K extends keyof SocketEventMap>(
    event: K,
    listener: Listener<K>,
  ) {
    const arr = this.listeners[event];
    if (!arr) return;

    this.listeners[event] = arr.filter(
      (l) => l !== listener,
    ) as (typeof this.listeners)[K];
  }

  public connect(token: string) {
    this.socket = io(`${BACKEND_SERVER}`, {
      path: SOCKETIO_ENDPOINT,
      autoConnect: false, // important for control
      transports: ["websocket"], // optional optimization
      auth: {
        token,
      },
    });

    this.socket.onAny((event, ...payload: any) => {
      console.log("Event received:", event);
      console.log("Payload:", payload);

      const arr = this.listeners[event as keyof SocketEventMap];
      if (!arr) return;

      arr.forEach((listener) => listener(payload));
    });

    this.socket.connect();
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public test() {
    const { socket } = this;
    if (socket) {
      socket.emit("hello", {}, (ack: any) => {
        console.log({ ack });
      });
    }
  }
}

let conn: SocketConnection | null = null;

export const getSocket = (): SocketConnection => {
  if (!conn) {
    conn = new SocketConnection();
  }
  return conn;
};
