import * as XLSX from "xlsx";

function exportToExcel(data: any) {
	const workbook = { SheetNames: ["Sheet 1"], Sheets: {} };
	const worksheet = XLSX.utils.json_to_sheet(data);
	// @ts-ignore
	workbook.Sheets["Sheet 1"] = worksheet;

	XLSX.writeFile(workbook, "data.xlsx");
}

export { exportToExcel };
