import { PettyErrorCode, pettyErrorMessages } from "../PettyErrors";

function handlePettyError(error: unknown): string | undefined {
	return pettyErrorMessages[error as PettyErrorCode];
}

export { handlePettyError };
