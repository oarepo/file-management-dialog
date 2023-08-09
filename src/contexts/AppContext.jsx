/* eslint-disable react/prop-types */
import { createContext, useRef } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ value, children }) => {
  const appConfigRef = useRef({
    baseUrl: "http://localhost:5173/api",
    recordId: 1,
  });
  // const appConfigRef = useRef(value);
  return <AppContext.Provider value={appConfigRef}>{children}</AppContext.Provider>;
};
