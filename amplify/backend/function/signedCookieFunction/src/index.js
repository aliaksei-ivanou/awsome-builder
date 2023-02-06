const aws = require("aws-sdk");

const SIGNING_URL = "https://d30bbnfu0x2i3e.cloudfront.net";

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
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours + 1,
    date.getMinutes(),
    date.getSeconds()
  );
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
    multiValueHeaders: {
      "Set-Cookie": [
        `CloudFront-Policy=${
          signedCookie["CloudFront-Policy"]
        };Domain=${SIGNING_URL};Path=/;Expires=${getExpirationTime().toUTCString()};Secure;HttpOnly;SameSite=Lax`,
        `CloudFront-Key-Pair-Id=${
          signedCookie["CloudFront-Key-Pair-Id"]
        };Domain=${SIGNING_URL};Path=/;Expires=${getExpirationTime().toUTCString()};Secure;HttpOnly;SameSite=Lax`,
        `CloudFront-Signature=${
          signedCookie["CloudFront-Signature"]
        };Domain=${SIGNING_URL};Path=/;Expires=${getExpirationTime().toUTCString()};Secure;HttpOnly;SameSite=Lax`,
      ],
    },
  };
};
