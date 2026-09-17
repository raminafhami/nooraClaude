function formatTime(duration: string | null | undefined): string | undefined {
	if (!duration) return;

	const minutes = Number(duration.replace("m", ""));

	const days = Math.floor(minutes / (24 * 60));
	const hours = Math.floor((minutes % (24 * 60)) / 60);
	const remainingMinutes = minutes % 60;

	const parts = [];
	if (days > 0) parts.push(`${days} روز`);
	if (hours > 0) parts.push(`${hours} ساعت`);
	if (remainingMinutes > 0) parts.push(`${remainingMinutes} دقیقه`);

	return parts.join(" و ") || "0 دقیقه";
}

export { formatTime };
