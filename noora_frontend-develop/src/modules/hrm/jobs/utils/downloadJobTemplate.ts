import { ExpertiseType } from "@/hrm/expertises/enums/ExpertiseType";
import { Expertise } from "@/hrm/expertises/models/Expertise";
import downloadTemplate from "@/template-engine/utils/downloadTemplate";

import { JobService } from "../JobService";
import { jobDepartments } from "../models/JobDepartment";

export default async function downloadJobTemplate(
  jobId: string,
  signatures: { personnel?: string; approver?: string } = {},
) {
  const jobDescription = await JobService.getById(jobId);

  const data = {
    code: jobDescription.code,
    name: jobDescription.name,
    goodsInspectionField: jobDescription.metadata?.goodsInspectionField ?? null,
    department:
      jobDepartments.find((x) => x.value === jobDescription.department)
        ?.label ?? "",
    supervisor: jobDescription.supervisor,
    definition: jobDescription.definition,
    degrees: jobDescription.requirements.degree.map((degree) => {
      let result = [degree.level, degree.name].filter((x) => x).join(" ");
      if (degree.field) {
        result += ` گرایش ${degree.field}`;
      }

      return result;
    }),
    experience: jobDescription.requirements.experience,
    certificates: (jobDescription.requirements.expertises as Expertise[])
      .filter((x) => x.type === ExpertiseType.Certificate)
      .map((x) => x.title),
    skills: (jobDescription.requirements.expertises as Expertise[])
      .filter((x) => x.type === ExpertiseType.Skill)
      .map((x) => x.title),
    knowledges: (jobDescription.requirements.expertises as Expertise[])
      .filter((x) => x.type === ExpertiseType.Knowledge)
      .map((x) => x.title),
    duties: jobDescription.duties,
    authorities: jobDescription.authorities,
    personnelSignature: signatures.personnel ?? null,
    approverSignature: signatures.approver ?? null,
  };

  let filename = jobDescription.name.trim();
  if (jobDescription.metadata?.goodsInspectionField) {
    filename += ` - ${jobDescription.metadata.goodsInspectionField.trim()}`;
  }

  await downloadTemplate({
    name: "jobs/JobDescription.html",
    output: filename,
    data,
  });
}
