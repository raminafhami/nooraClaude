import { UserDocument } from "@/identity/userDocuments/models/UserDocument";
import GetAllUserDocuments from "@/identity/userDocuments/services/getAllUserDocuments";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";

async function getUserSignature(userId: string): Promise<string | undefined> {
  const userDocuments: UserDocument[] | undefined = await GetAllUserDocuments({
    userId: userId,
    key: "signature",
    page: 0,
    size: 1,
  });

  if (!userDocuments || userDocuments.length === 0) {
    return;
  }

  const signatureFile: Blob | undefined = await GetUserDocumentsFile({
    fileId: userDocuments[0].id,
  });

  if (!signatureFile) {
    return;
  }

  // return URL.createObjectURL(signatureFile);

  const fileStr: string = await new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(signatureFile);
  });

  return fileStr;
}

export { getUserSignature };
