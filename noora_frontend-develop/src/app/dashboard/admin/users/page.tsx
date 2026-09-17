import { Metadata } from "next";
import { FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Layout } from "@/ui/Layout";

import { UsersWidget } from "./_components/UsersWidget";

const metadata: Metadata = {
  title: "Users",
};

function UsersPage() {
  return (
    <Layout.Root>
      <Layout.Head title="کاربران">
        <div className="sm:ms-auto">
          <DynamicLink href="/dashboard/admin/users/add">
            <Button variant="primary">
              <FaPlus />
              افزودن کاربر جدید
            </Button>
          </DynamicLink>
        </div>
      </Layout.Head>
      <Layout.Content>
        <UsersWidget />
      </Layout.Content>
    </Layout.Root>
  );
}

export { metadata };
export default UsersPage;
