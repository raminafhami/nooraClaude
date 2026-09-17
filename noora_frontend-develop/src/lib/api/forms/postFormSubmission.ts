import apiClient from "../client";

interface PostFormSubmissionProps {
  data: object;
  userId: string;
  id: string;
}

export default async function PostFormSubmission({
  data,
  userId,
  id,
}: PostFormSubmissionProps) {
  let response;
  let link = `forms/${id}/submission`;

  response = await apiClient.post({
    url: link,
    body: {
      data,
      userId,
    },
  });

  return response;
}
