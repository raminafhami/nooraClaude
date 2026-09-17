import { ReactNode } from "react";

import { ModalSize } from "./";

export interface ModalProps {
  show: boolean;
  name: string;
  size: ModalSize;
  title: string;
  content: ReactNode;
  data: any;
}

interface ActionLoad {
  type: "LOAD";
  name: string;
  size: ModalSize;
  title: string;
  content: ReactNode;
}

interface ActionUpdate {
  type: "UPDATE";
  name?: string;
  size?: ModalSize;
  title?: string;
  content?: ReactNode;
  data?: any;
}

interface ActionOpen {
  type: "OPEN";
}

interface ActionClose {
  type: "CLOSE";
}

export type ModalAction = ActionLoad | ActionUpdate | ActionOpen | ActionClose;

export function modalReducer(
  modal: ModalProps,
  action: ModalAction
): ModalProps {
  switch (action.type) {
    case "LOAD":
      return {
        ...modal,
        name: action.name,
        size: action.size,
        title: action.title,
        content: action.content,
      };
    case "UPDATE":
      return {
        ...modal,
        name: action.name ?? modal.name,
        size: action.size ?? modal.size,
        title: action.title ?? modal.title,
        content: action.content ?? modal.content,
        data: action.data !== undefined ? action.data : modal.data,
      };
    case "OPEN":
      return {
        ...modal,
        show: true,
      };
    case "CLOSE":
      return {
        ...modal,
        show: false,
      };
  }
}
