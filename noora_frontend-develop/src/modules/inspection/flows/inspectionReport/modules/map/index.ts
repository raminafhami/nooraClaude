import dynamic from "next/dynamic";
import React from "react";

import { Loading } from "@/ui/Loader/Loading";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default Map;
