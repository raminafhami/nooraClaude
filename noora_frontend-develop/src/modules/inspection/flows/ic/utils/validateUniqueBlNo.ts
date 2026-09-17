import { getInstances } from "@/felo/instances/services/getInstances";

async function validateUniqueBlNo(
  instanceId: string,
  blNo: string,
): Promise<string[]> {
  const duplicates = await getInstances({
    filters: [
      {
        name: "processDefinitionKey",
        value: "Inspection_Case_IC",
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

  return duplicates.map((x) => x.caseNo);
}

export { validateUniqueBlNo };
