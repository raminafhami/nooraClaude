import { Metadata } from "next";
import { redirect } from "next/navigation";

import { Branch } from "@/branches/models/Branch";
import { getBranchById } from "@/branches/services/getBranchById";

import { BranchWidget } from "./_components/BranchWidget";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Branch",
};

interface Props {
  params: {
    id: string;
  };
}

export default async function Page({ params: { id } }: Props) {
  let branch: Branch;

  try {
    branch = await getBranchById(id);
    return <BranchWidget data={branch} />;
  } catch (err: any) {
    console.error(err);
    redirect("/dashboard/admin");
  }
}
