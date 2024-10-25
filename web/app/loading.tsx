import Loading from "@/components/layouts/loading";
import logger from "@/lib/logger";
import React from "react";

const loading = () => {
  logger.info("Loading...");
  return <Loading />;
};

export default loading;
