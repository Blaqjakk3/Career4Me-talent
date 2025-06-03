import React, { createContext, useContext, useState } from 'react';

interface SavedCareerPathsContextType {
  savedPaths: string[];
  savePath: (id: string) => void;
  isPathSaved: (id: string) => boolean;
}

const SavedCareerPathsContext = createContext<SavedCareerPathsContextType | undefined>(undefined);

export const SavedCareerPathsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedPaths, setSavedPaths] = useState<string[]>([]);

  const savePath = (id: string) => {
    setSavedPaths((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const isPathSaved = (id: string) => savedPaths.includes(id);

  return (
    <SavedCareerPathsContext.Provider value={{ savedPaths, savePath, isPathSaved }}>
      {children}
    </SavedCareerPathsContext.Provider>
  );
};

export const useSavedCareerPaths = (): SavedCareerPathsContextType => {
  const context = useContext(SavedCareerPathsContext);
  if (!context) {
    throw new Error("useSavedCareerPaths must be used within a SavedCareerPathsProvider");
  }
  return context;
};
