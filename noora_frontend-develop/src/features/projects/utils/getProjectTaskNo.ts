function getProjectTaskNo(taskNo?: string): string | undefined {
	return taskNo?.split("-").at(1);
}

export { getProjectTaskNo };
