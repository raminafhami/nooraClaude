import { useContext } from "react";

import { PersonnelContext } from "./PersonnelContext";

function usePersonnelContext() {
  return useContext(PersonnelContext);
}

export default usePersonnelContext;
