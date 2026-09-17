import { Metadata } from "next";

import { Layout } from "@/ui/Layout";

import ManagementClient from "./_components/managementClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "manager dashboard",
};

export default function ManagementPage() {
  return (
    <Layout.Root>
      <Layout.Head title="مدیریت" />
      <Layout.Content>
        <ManagementClient />
      </Layout.Content>
    </Layout.Root>
  );
}
