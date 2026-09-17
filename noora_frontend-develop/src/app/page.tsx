import { redirect, RedirectType } from "next/navigation";

function RootPage() {
  redirect("/login", RedirectType.replace);
}

export default RootPage;
