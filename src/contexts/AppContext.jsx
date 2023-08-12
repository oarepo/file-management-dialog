/* eslint-disable react/prop-types */
import { createContext, useRef } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ value, children }) => {
  const appConfigRef = useRef({
    ...value,
    baseUrl: "http://localhost:5173/api",
  });
  // const appConfigRef = useRef(value);
  return <AppContext.Provider value={appConfigRef}>{children}</AppContext.Provider>;
};
