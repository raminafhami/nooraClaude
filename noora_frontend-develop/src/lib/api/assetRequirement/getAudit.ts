import apiClient from "../client";

interface GetAuditProps {
  page: number;
  size: number;
  id?: string;
  searchAttribute?: SearchAttributeProps;
}

interface SearchAttributeProps {
  title?: string;
  category?: string;
  auditNo?: string;
  state?: string;
  users?: string;
  userGroups?: string[];
}

export default async function GetAudit({
  page,
  size,
  id,
  searchAttribute,
}: GetAuditProps) {
  const filters: any = {};

  if (id) {
    filters._id = id;
  }

  if (searchAttribute) {
    if (searchAttribute.title) {
      filters.title = { $regex: searchAttribute.title, $options: "i" };
    }
    if (searchAttribute.category) {
      filters.category = searchAttribute.category;
    }
    if (searchAttribute.auditNo) {
      filters.auditNo = { $regex: searchAttribute.auditNo, $options: "i" };
    }
    if (searchAttribute.state) {
      filters.state = searchAttribute.state === "true" ? true : false;
    }
    if (searchAttribute.users || searchAttribute.userGroups) {
      filters.$or = filters.$or || []; // Ensure $or array is initialized
      if (searchAttribute.users) {
        filters.$or.push({
          "users.id": searchAttribute.users,
        });
      }
      if (searchAttribute.userGroups) {
        filters.$or.push({
          "userGroups.name": { $in: searchAttribute.userGroups },
        });
      }
    }
  }

  const link = `audit?page=${page ?? 0}&size=${
    size ?? 10
  }&filters=${encodeURIComponent(
    JSON.stringify(filters),
  )}&sort=${JSON.stringify({
    auditNo: 1,
  })}&populate=users userGroups`;

  const response = await apiClient.get({ url: link });

  return response;
}
