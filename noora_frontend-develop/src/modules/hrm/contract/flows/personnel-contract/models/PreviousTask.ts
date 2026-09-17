type PreviousTask = {
  taskKey: string;
  assigneeKey: string;
  assigneeTitle?: string;
  noteContent: string;
  noteType?: "info" | "danger";
};

export { type PreviousTask };
