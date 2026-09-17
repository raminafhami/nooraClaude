function getTodayDate(format?: "string"): string;

function getTodayDate(format: "date"): Date;

function getTodayDate(format: "string" | "date" = "string"): string | Date {
  const today = new Date();

  if (format === "string") {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}/${month}/${day}`;
  }

  return today;
}

export { getTodayDate };
