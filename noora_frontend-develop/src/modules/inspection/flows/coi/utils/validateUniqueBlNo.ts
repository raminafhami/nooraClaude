import { getInstances } from "@/felo/instances/services/getInstances";

async function validateUniqueBlNo(
  instanceId: string,
  blNo: string,
): Promise<void> {
  const duplicates = await getInstances({
    filters: [
      {
        name: "processDefinitionKey",
        value: "Inspection_Case_COI",
      },
      {
        name: "_id",
        value: { $ne: instanceId },
      },
      {
        name: "parameters.BillOfLadingNo",
        value: {
          $regex: `^${blNo}$`,
          $options: "i",
        },
      },
    ],
  });

  if (duplicates.length > 0) {
    throw new Error("شماره بارنامه مورد نظر تکراری است.");
  }
}

export { validateUniqueBlNo };
