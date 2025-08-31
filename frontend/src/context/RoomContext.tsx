import React, { createContext, useState, ReactNode } from 'react';

type RoomContextType = {
  currentRoom: string | null;
  setCurrentRoom: (id: string | null) => void;
};

export const RoomContext = createContext<RoomContextType>({
  currentRoom: null,
  setCurrentRoom: () => {},
});

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  return (
    <RoomContext.Provider value={{ currentRoom, setCurrentRoom }}>
      {children}
    </RoomContext.Provider>
  );
};
