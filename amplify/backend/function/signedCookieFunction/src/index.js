const aws = require("aws-sdk");

const SIGNING_URL = "d30bbnfu0x2i3e.cloudfront.net";

const cache = {};

const loadKeys = async () => {
  const { Parameters } = await new aws.SSM()
    .getParameters({
      Names: ["signerPrivateKey", "signerPublicKey"].map(
        (secretName) => process.env[secretName]
      ),
      WithDecryption: true,
    })
    .promise();
  return Parameters.reduce((acc, { Name, Value }) => {
    acc[Name.split("_").pop()] = Value;
    return acc;
  }, cache);
};

function getExpirationTime() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

function getExpiryTime() {
  return Math.floor(getExpirationTime().getTime() / 1000);
}

const policyString = JSON.stringify({
  Statement: [
    {
      Resource: `http*://${SIGNING_URL}/files/*`,
      Condition: {
        DateLessThan: { "AWS:EpochTime": getExpiryTime() },
      },
    },
  ],
});

function getSignedCookie(publicKey, privateKey) {
  const cloudFront = new aws.CloudFront.Signer(publicKey, privateKey);
  const options = { policy: policyString };
  return cloudFront.getSignedCookie(options);
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  if (cache.publicKey == null || cache.privateKey == null) {
    await loadKeys();
  }

  const signedCookie = getSignedCookie(
    cache.signerPublicKey,
    cache.signerPrivateKey
  );

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://d30bbnfu0x2i3e.cloudfront.net",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods":
        "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Set-Cookie",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
    multiValueHeaders: {
      "Set-Cookie": [
        `CloudFront-Policy=${
          signedCookie["CloudFront-Policy"]
        };Path=/;Expires=${getExpirationTime().toUTCString()};Secure;HttpOnly;SameSite=None`,
        `CloudFront-Key-Pair-Id=${
          signedCookie["CloudFront-Key-Pair-Id"]
        };Path=/;Expires=${getExpirationTime().toUTCString()};Secure;HttpOnly;SameSite=None`,
        `CloudFront-Signature=${
          signedCookie["CloudFront-Signature"]
        };Path=/;Expires=${getExpirationTime().toUTCString()};Secure;HttpOnly;SameSite=None`,
      ],
    },
  };
};
