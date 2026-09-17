"use client";

import { useEffect, useState } from "react";

import { PagedResult } from "@/models";

import { UserGroup } from "../models/Group";
import {
  GroupBaseQuery,
  GroupPagedQuery,
  GroupQuery,
} from "../models/GroupQuery";
import { UserGroupType } from "../models/GroupType";
import { getGroups } from "../services/getGroups";

interface UseGroupsReturn<T> {
  isLoading: boolean;
  error: string | undefined;
  groups: T | undefined;
}

export function useRoles(
  options?: GroupBaseQuery
): UseGroupsReturn<UserGroup[]>;

export function useRoles(
  options?: GroupPagedQuery
): UseGroupsReturn<PagedResult<UserGroup>>;

export function useRoles(
  options?: GroupQuery
): UseGroupsReturn<UserGroup[] | PagedResult<UserGroup>> {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();
  const [groups, setGroups] = useState<UserGroup[] | PagedResult<UserGroup>>();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(undefined);
        setGroups(
          await getGroups(UserGroupType.Role, {
            sort: { parentId: "asc", title: "asc" },
            ...(options ?? {}),
          })
        );
      } catch (err) {
        setError("Something weng wrong...");
        setGroups(undefined);
      } finally {
        setLoading(false);
      }
    })();
  }, [options]);

  return { isLoading, error, groups };
}
