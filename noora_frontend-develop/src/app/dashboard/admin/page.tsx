import { Metadata } from "next";

import AdminClient from "./_components/AdminClient";

const metadata: Metadata = {
  title: "ادمین",
};

function AdminPage() {
  return <AdminClient />;
}

export { metadata };
export default AdminPage;
