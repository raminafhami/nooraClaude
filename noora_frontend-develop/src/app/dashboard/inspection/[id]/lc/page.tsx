import { Metadata } from "next";

import { PageWidget } from "@/inspection/flows/lc/pages/PageWidget";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Inspection Case",
};

interface Props {
  params: {
    id: string;
  };
}

export default function Page({ params: { id } }: Props) {
  return <PageWidget id={id} />;
}
