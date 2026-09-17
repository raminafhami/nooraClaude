import apiClient from "../client";

interface postSubContractorProps {
  file: File;
  name: string;
  reasonAssignment: string;
  evaluationDate: string;
  nextEvaluationDate: string;
}

export default async function postSubContractor({
  file,
  name,
  reasonAssignment,
  evaluationDate,
  nextEvaluationDate,
}: postSubContractorProps) {
  let response;
  let link = `sub-contractor`;

  response = await apiClient.post({
    url: link,
    body: {
      file,
      name,
      reasonAssignment,
      evaluationDate,
      nextEvaluationDate,
    },
    contentType: "multipart",
  });

  return response;
}
