import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { UserDocument } from "@/identity/userDocuments/models/UserDocument";
import GetAllUserDocuments from "@/identity/userDocuments/services/getAllUserDocuments";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";
import PostUserDocument from "@/identity/userDocuments/services/postUserDocument";

import { DocumentItem } from "./DocumentItem";
import { DocumentSignature } from "./DocumentSignature";

export interface FormData {
  birthCertificate: File;
  birthCertificateMarriagePage: File;
  criminalRecord: File;
  degree: File;
  militaryCard: File;
  nationalFrontCard: File;
  nationalBackCard: File;
  personnelPhoto: File;
  signature: File;
}

const documentsDefinitions: Partial<{ [key in keyof FormData]: string }> = {
  nationalFrontCard: "روی کارت ملی",
  nationalBackCard: "پشت کارت ملی",
  birthCertificate: "صفحه اول شناسنامه",
  birthCertificateMarriagePage: "صفحه ازدواج شناسنامه",
  personnelPhoto: "عکس پرسنلی",
  militaryCard: "کارت پایان خدمت یا معافیت",
  degree: "آخرین مدرک تحصیلی",
  criminalRecord: "سوء پیشینه",
};

export function ProfileDocuments() {
  const { identity } = useLoggedInUser();

  const [isLoading, setLoading] = useState<boolean>(true);

  const form = useForm<FormData>();
  const { register, setValue } = form;

  useEffect(() => {
    register("birthCertificate");
    register("birthCertificateMarriagePage");
    register("criminalRecord");
    register("degree");
    register("militaryCard");
    register("nationalBackCard");
    register("nationalFrontCard");
    register("personnelPhoto");
    register("signature");
  }, [register]);

  const loadFile = useCallback(
    async (fileId: string, key: string) => {
      const result: Blob = await GetUserDocumentsFile({ fileId: fileId });

      if (result) {
        setValue(key as any, result);
      }
    },
    [setValue],
  );

  const loadDocuments = useCallback(async () => {
    setLoading(true);

    try {
      const documents: UserDocument[] = await GetAllUserDocuments({
        page: 0,
        size: Number.MAX_SAFE_INTEGER,
        userId: identity.id,
      });

      await Promise.all(
        documents
          .filter((x) => x.key)
          .map(async (doc) => {
            await loadFile(doc.id, doc.key!);
          }),
      );
    } catch (error) {
      toast.error("خطایی در دریافت مدارک رخ داد!");
    } finally {
      setLoading(false);
    }
  }, [loadFile, identity.id]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const uploadFile = useCallback(
    async ({
      title,
      key,
      v,
    }: {
      title: string;
      key: keyof FormData;
      v: File;
    }) => {
      setLoading(true);

      try {
        const uploadedDocument = await PostUserDocument({
          file: v,
          title,
          status: "confirm",
          key,
          userId: identity.id,
        });

        setValue(key, v);
      } catch (error) {
        toast.error("مشکلی پیش آمده، مجدد بارگذاری کنید!");
      } finally {
        setLoading(false);
      }
    },
    [identity.id, setValue],
  );

  return (
    <FormProvider {...form}>
      <div className="grid grid-cols-4 gap-y-6">
        <div className="col-span-3 grid grid-cols-1 xl:grid-cols-12 lg:grid-cols-9 md:grid-cols-6 sm:grid-cols-4 xs:grid-cols-2 gap-x-20 gap-y-8">
          {Object.keys(documentsDefinitions).map((k) => {
            const key = k as keyof FormData;

            return (
              <DocumentItem
                loading={isLoading}
                key={key}
                itemKey={key}
                title={documentsDefinitions[key] || ""}
                onUpload={uploadFile}
              />
            );
          })}

          <DocumentSignature
            loading={isLoading}
            onUpload={({ v }) =>
              uploadFile({
                title: "امضا",
                key: "signature",
                v,
              })
            }
          />
        </div>
      </div>
    </FormProvider>
  );
}
