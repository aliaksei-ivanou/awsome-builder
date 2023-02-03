const contentData = [
  {
    title: "Roles assumption",
    description:
      "Administrators manage the products catalog, orders, and have access to products documentation. Wholesalers manage orders, have access to products documentation. Contractors work in the field and need to access the product documentation",
  },
  {
    title: "Authentication and authorization",
    description:
      "Auth0 is used as an identity provider. It returns user's roles as part of the JWT token.",
  },
  {
    title: "Anomaly Detection",
    link: "https://auth0.com/docs/anomaly-detection",
    description:
      "Auth0 can detect anomalies and stop malicious attempts to access your application. Anomaly detection can alert you and your users of suspicious activity, as well as block further login attempts.",
  },
  {
    title: "Learn About Rules",
    link: "https://auth0.com/docs/rules",
    description:
      "Rules are JavaScript functions that execute when a user authenticates to your application. They run once the authentication process is complete, and you can use them to customize and extend Auth0's capabilities.",
  },
];

export default contentData;
