import { read, utils } from "xlsx";

import { ObjectType } from "@/utils/object/ObjectType";

function importFromExcel<T extends ObjectType = ObjectType>(
  file: File,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = read(data, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert the sheet to JSON
      const obj = utils.sheet_to_json<T>(worksheet, { header: 1 });
      resolve(obj);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}

export { importFromExcel };
