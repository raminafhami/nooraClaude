import { decodeJwt } from "jose";

import { Identity } from "../models/Identity";

function extractIdentity(accessToken: string | undefined): Identity | null {
	if (!accessToken) {
		return null;
	}

	const decodedToken = decodeJwt(accessToken) as any;

	const identity: Identity = {
		id: decodedToken.id,
		type: decodedToken.type,
		fullname: decodedToken.fullName,
		email: decodedToken.email,
		phoneNo: decodedToken.phoneNo,
		branchId: decodedToken.branchId,
		groups: decodedToken.groups,
		expireAt: decodedToken.exp,
	};

	return identity;
}

export { extractIdentity };
