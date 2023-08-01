/* eslint-disable react/prop-types */
import { createContext, useRef } from "react";

export const RefContext = createContext();

export const RefProvider = ({ children }) => {
  const ref = useRef(false);
  return <RefContext.Provider value={ref}>{children}</RefContext.Provider>;
};
