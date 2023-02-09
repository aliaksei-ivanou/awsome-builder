import React, { Fragment, useEffect } from "react";
import Content from "../components/Content";
import Hero from "../components/Hero";
import { useApiWrapper } from "../utils/api";

const Home = () => {
  const { setCookies } = useApiWrapper();

  useEffect(() => {
    if (
      !document.cookie.includes("CloudFront-Signature") ||
      !document.cookie.includes("CloudFront-Key-Pair-Id") ||
      !document.cookie.includes("CloudFront-Policy")
    ) {
      setCookies();
    }
  }, []);

  return (
    <Fragment>
      <Hero />
      <Content />
    </Fragment>
  );
};

export default Home;
