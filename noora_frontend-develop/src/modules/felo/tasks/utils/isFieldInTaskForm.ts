interface TaskLike {
  properties: {
    key: string;
  }[];
}

function isFieldInTaskForm({ properties }: TaskLike, fieldName: string) {
  return properties.some((x) => x.key === fieldName);
}

export { isFieldInTaskForm };
