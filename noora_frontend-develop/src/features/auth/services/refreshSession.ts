import { AuthenticationTokens } from "../models/AuthenticationTokens";
import setUniversalSession from "../utils/setUniversalSession";
import { refreshTokens } from "./refreshTokens";

/**
 * Single-flight refresh.
 *
 * The backend rotates refresh tokens: `authentication/refresh-tokens` deletes
 * the presented token id from Redis before issuing a new pair. A second call
 * carrying the same (now invalidated) refresh token therefore gets a 401 and
 * the caller clears the session - which is what logged users out while they
 * were still active. Concurrent refreshes share one request here, so a token
 * is only ever redeemed once.
 */
let inFlight: Promise<AuthenticationTokens> | null = null;

function refreshSession(refreshToken: string): Promise<AuthenticationTokens> {
	if (!inFlight) {
		inFlight = refreshTokens({ refreshToken })
			.then((tokens) => {
				setUniversalSession(tokens);
				return tokens;
			})
			.finally(() => {
				inFlight = null;
			});
	}

	return inFlight;
}

export { refreshSession };
