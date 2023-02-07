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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
    body: JSON.stringify([
      {
        name: "CloudFront-Policy",
        value: signedCookie["CloudFront-Policy"],
        expires: getExpirationTime().toUTCString(),
      },
      {
        name: "CloudFront-Key-Pair-Id",
        value: signedCookie["CloudFront-Key-Pair-Id"],
        expires: getExpirationTime().toUTCString(),
      },
      {
        name: "CloudFront-Signature",
        value: signedCookie["CloudFront-Signature"],
        expires: getExpirationTime().toUTCString(),
      },
    ]),
  };
};
