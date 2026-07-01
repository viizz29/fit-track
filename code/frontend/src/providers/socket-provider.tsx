// SocketProvider.tsx
import React, { createContext, useContext, useEffect } from "react";
import { getSocket, SocketConnection } from "@/services/socket";
import { useAuth } from "@/context/use-auth";
import { SOCKETIO_ENABLED } from "@/config";

const SocketContext = createContext<SocketConnection | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {

  const socket = getSocket();
  const { isAuthReady, token } = useAuth();


  useEffect(() => {
    if (isAuthReady && token && SOCKETIO_ENABLED) {
      socket.connect(token);
      return () => {
        socket.disconnect();
      };
    }

  }, [isAuthReady, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);