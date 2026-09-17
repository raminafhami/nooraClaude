import apiClient from "../client";

interface PutFormProps {
  title: string;
  groups: Array<string>;
  evaluator: string;
  certificateCode: string;
  indicatorId: string;
  questions: Array<{
    questionId: string;
    title: string;
  }>;
  endDate: any;
  startEvalNumber: number;
  endEvalNumber: number;
  id: string;
}

export default async function PutForm({
  title,
  groups,
  evaluator,
  certificateCode,
  indicatorId,
  questions,
  endDate,
  endEvalNumber = 99,
  startEvalNumber = 10,
  id,
}: PutFormProps) {
  let response;
  let link = `forms/${id}`;

  response = await apiClient.put({
    url: link,
    body: {
      title,
      groups,
      evaluator,
      questions,
      certificateCode,
      indicatorId,
      endDate,
      endEvalNumber,
      startEvalNumber,
    },
  });

  return response;
}
