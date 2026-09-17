"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import GetFormById from "@/api/forms/getFormById";

import { FormGenerator } from "../_components/FormGenerator";

export default function EditForm({}) {
  const params = useParams();
  const [data, setData] = useState();
  useEffect(() => {
    if (params.id) {
      let res;
      try {
        res = GetFormById({
          id: params.id as string,
        });
        res.then((res: any) => {
          if (res) {
            setData(res.result);
          }
        });
      } catch (error) {
        toast.error("اطلاعات مورد نظر یافت نشد!");
      }
    }
  }, []);
  return (
    <div className="px-40 py-10">
      <FormGenerator data={data} />
    </div>
  );
}
