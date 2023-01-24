require("dotenv").config({ silent: true });

const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");
const util = require("util");

const getPolicyDocument = (effect, resource) => {
  const policyDocument = {
    Version: "2012-10-17", // default version
    Statement: [
      {
        Action: "execute-api:Invoke", // default action
        Effect: effect,
        Resource: resource,
      },
    ],
  };
  return policyDocument;
};

const authorize = (methodArn, roles) => {
  var tmp = methodArn.split(":");
  var apiGatewayArnTmp = tmp[5].split("/");
  var method = apiGatewayArnTmp[2];
  var resource = "/"; // root resource
  if (apiGatewayArnTmp[3]) {
    resource += apiGatewayArnTmp[3];
  }

  if (roles.includes("Admin")) {
    // Admin can do anything
    return getPolicyDocument("Allow", methodArn);
  } else if (
    // Contractor can only get documents
    roles.includes("Contractor") &&
    method === "GET" &&
    resource.includes("documents")
  ) {
    return getPolicyDocument("Allow", methodArn);
  } else if (
    // Wholesaler can only get documents and manage orders
    roles.includes("Wholesaler") &&
    ((method === "GET" && resource.includes("documents")) ||
      resource.includes("orders"))
  ) {
    return getPolicyDocument("Allow", methodArn);
  } else {
    return getPolicyDocument("Deny", methodArn);
  }
};

// extract and return the Bearer Token from the Lambda event parameters
const getToken = (params) => {
  if (!params.type || params.type !== "TOKEN") {
    throw new Error('Expected "event.type" parameter to have value "TOKEN"');
  }

  const tokenString = params.authorizationToken;
  if (!tokenString) {
    throw new Error('Expected "event.authorizationToken" parameter to be set');
  }

  const match = tokenString.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new Error(
      `Invalid Authorization token - ${tokenString} does not match "Bearer .*"`
    );
  }
  return match[1];
};

const jwtOptions = {
  audience: process.env.AUDIENCE,
  issuer: process.env.TOKEN_ISSUER,
};

module.exports.authenticate = (params) => {
  console.log(params);
  const token = getToken(params);

  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error("invalid token");
  }

  const getSigningKey = util.promisify(client.getSigningKey);
  return getSigningKey(decoded.header.kid)
    .then((key) => {
      const signingKey = key.publicKey || key.rsaPublicKey;
      return jwt.verify(token, signingKey, jwtOptions);
    })
    .then((decoded) => ({
      principalId: decoded.sub,
      policyDocument: authorize(params.methodArn, decoded.anycompany_roles),
      context: { scope: decoded.scope },
    }));
};

const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: process.env.JWKS_URI,
});
