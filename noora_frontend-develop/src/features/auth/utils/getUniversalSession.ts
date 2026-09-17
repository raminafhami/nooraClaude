import { Session } from "../models/Session";
import { getServerSession } from "./getServerSession";
import { getSession } from "./getSession";

function getUniversalSession(): Session {
  let session: Session;

  if (typeof window === "undefined") {
    session = getServerSession();
  } else {
    session = getSession();
  }

  return session;
}

export default getUniversalSession;
