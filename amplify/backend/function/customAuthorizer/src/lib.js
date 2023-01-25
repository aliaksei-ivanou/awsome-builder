require("dotenv").config({ silent: true });

const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");
const util = require("util");

const getPolicyDocument = (resource) => {
  const policyDocument = {
    Version: "2012-10-17", // default version
    Statement: [
      {
        Action: "execute-api:Invoke", // default action
        Effect: "Allow",
        Resource: resource,
      },
    ],
  };
  return policyDocument;
};

const policies = {
  admin: getPolicyDocument("*"),
  contractor: getPolicyDocument(
    "arn:aws:execute-api:us-east-2:247045843940:g6i5cr5cjd/ESTestInvoke-stage/GET/documents"
  ),
  wholesaler: getPolicyDocument([
    "arn:aws:execute-api:us-east-2:247045843940:g6i5cr5cjd/ESTestInvoke-stage/GET/documents",
    "arn:aws:execute-api:us-east-2:247045843940:g6i5cr5cjd/ESTestInvoke-stage/*/orders",
    "arn:aws:execute-api:us-east-2:247045843940:g6i5cr5cjd/ESTestInvoke-stage/*/items",
  ]),
  default: getPolicyDocument(""),
};

const authorize = (roles) => {
  if (roles.includes("Admin")) {
    return policies.admin;
  } else if (roles.includes("Contractor")) {
    return policies.contractor;
  } else if (roles.includes("Wholesaler")) {
    return policies.wholesaler;
  } else {
    return policies.default;
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
      policyDocument: authorize(decoded.anycompany_roles),
      context: { scope: decoded.scope },
    }));
};

const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: process.env.JWKS_URI,
});
