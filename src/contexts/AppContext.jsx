/* eslint-disable react/prop-types */
import { useRef } from "preact/hooks";
import { createContext } from "preact";

export const AppContext = createContext();

export const AppContextProvider = ({ value, children }) => {
  const appConfigRef = useRef({
    ...value
  });
  return <AppContext.Provider value={appConfigRef}>{children}</AppContext.Provider>;
};
