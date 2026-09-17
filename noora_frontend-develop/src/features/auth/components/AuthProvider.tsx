import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AuthContext, AuthContextType } from "../context/AuthContext";
import { AuthenticationStatus } from "../enums/AuthenticationStatus";
import { useSession } from "../hooks/useSession";
import { Identity } from "../models/Identity";
import { refreshSession } from "../services/refreshSession";
import { clearUniversalSession } from "../utils/clearUniversalSession";
import { extractIdentity } from "../utils/extractdentity";
import { isAuthorized as isAuthorizedUtilFn } from "../utils/isAuthorized";

function AuthProvider({ children }: Readonly<PropsWithChildren>) {
	const { accessToken, refreshToken } = useSession();

	const [identity, setIdentity] = useState<Identity | null>(null);
	const [status, setStatus] = useState<AuthenticationStatus>(
		AuthenticationStatus.Authenticating,
	);

	const isAuthorized = useCallback(
		({
			groups,
			userIds,
			userPhoneNos,
		}: Partial<{
			groups: string[];
			userIds: string[];
			userPhoneNos: string[];
		}> = {}) => isAuthorizedUtilFn(identity, { groups, userIds, userPhoneNos }),
		[identity],
	);

	const contextValue = useMemo<AuthContextType>(
		() => ({ identity, status, isAuthorized }),
		[identity, status, isAuthorized],
	);

	const refreshTokenTimeout = useRef<NodeJS.Timeout>();

	useEffect(() => {
		(async () => {
			if (accessToken) {
				setIdentity(extractIdentity(accessToken));
				setStatus(AuthenticationStatus.Authenticated);
			} else if (refreshToken) {
				setStatus(AuthenticationStatus.Authenticating);
			} else {
				setIdentity(null);
				setStatus(AuthenticationStatus.Unauthenticated);
			}
		})();
	}, [accessToken, refreshToken]);

	useEffect(() => {
		(async () => {
			if (refreshToken && !identity) {
				refreshTokenTimeout.current = setTimeout(async () => {
					try {
						await refreshSession(refreshToken);
					} catch {
						clearUniversalSession();
					}
				}, 1000);
			}
		})();

		return () => {
			clearTimeout(refreshTokenTimeout.current);
		};
	}, [identity, refreshToken]);

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
}

export { AuthProvider };
