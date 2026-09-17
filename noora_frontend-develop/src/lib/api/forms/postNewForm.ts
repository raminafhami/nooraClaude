import apiClient from "../client";

interface PostNewFormProps {
  title: string;
  groups: Array<string>;
  evaluator: string;
  certificateCode: string;
  indicatorKey: string;
  questions: Array<{
    questionId: string;
    title: string;
  }>;
  endDate: any;
  startEvalNumber: number;
  endEvalNumber: number;
}

export default async function PostNewForm({
  title,
  groups,
  evaluator,
  certificateCode,
  indicatorKey,
  questions,
  endDate,
  endEvalNumber = 99,
  startEvalNumber = 10,
}: PostNewFormProps) {
  let response;
  let link = `forms/`;

  response = await apiClient.post({
    url: link,
    body: {
      title,
      groups,
      evaluator,
      questions,
      certificateCode,
      indicatorKey,
      endDate,
      endEvalNumber,
      startEvalNumber,
    },
  });

  return response;
}
