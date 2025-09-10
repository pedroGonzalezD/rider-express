import { createContext, useContext, useState } from "react";

const LoaderContext = createContext(null);

export const LoaderProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoader = () => setLoadingCount(prev => prev + 1);
  const hideLoader = () => setLoadingCount(prev => Math.max(prev - 1, 0));

  return (
    <LoaderContext.Provider value={{ loading: loadingCount > 0, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
