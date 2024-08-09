import { useRef, createContext } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ value, children }) => {
  const appConfigRef = useRef({
    ...value
  });
  return <AppContext.Provider value={appConfigRef}>{children}</AppContext.Provider>;
};
