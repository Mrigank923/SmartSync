import React, { createContext, useState } from 'react';

export const RoomContext = createContext({
  currentRoom: null,
  setCurrentRoom: () => {},
});

export const RoomProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(null);
  return (
    <RoomContext.Provider value={{ currentRoom, setCurrentRoom }}>
      {children}
    </RoomContext.Provider>
  );
};
