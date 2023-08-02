/* eslint-disable react/prop-types */
import { createContext, useRef } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const appData = useRef({
    baseUrl: "http://localhost:5173/api",
    recordId: 1,
  });
  return <AppContext.Provider value={appData}>{children}</AppContext.Provider>;
};
