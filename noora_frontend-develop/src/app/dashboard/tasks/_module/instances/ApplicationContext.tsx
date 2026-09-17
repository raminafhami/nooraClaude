"use client";

import { createContext, PropsWithChildren } from "react";

import { Application } from "./models/Application";

interface ApplicationContextType {
  application: Application;
}

export const ApplicationContext = createContext<ApplicationContextType>(
  {} as ApplicationContextType
);

interface Props extends PropsWithChildren {
  application: Application;
}

export function ApplicationProvider({ application, children }: Props) {
  return (
    <ApplicationContext.Provider value={{ application }}>
      {children}
    </ApplicationContext.Provider>
  );
}
