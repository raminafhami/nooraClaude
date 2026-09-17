function isEntityLocked(entity: { lock?: number | null | undefined }): boolean {
	if (!entity.lock) return false;
	return new Date(entity.lock) >= new Date();
}

export { isEntityLocked };
