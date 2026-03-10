import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

import { me } from "@/lib/api-client";
import type { User } from "@/lib/types";

export function useAuth(enabled = true) {
  const hasToken = Boolean(Cookies.get("tracker_access"));

  const query = useQuery<User>({
    queryKey: ["me"],
    queryFn: me,
    enabled: enabled && hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    hasToken,
  };
}
