const AWS = require('aws-sdk');

const cloudfront = new AWS.CloudFront();
const pathToInvalidate = `/cli/*`;

const invalidationRequest = cloudfront.createInvalidation({
  DistributionId: 'E2VWLFSCSD1GLA',
  InvalidationBatch: {
    CallerReference: new Date().getTime().toString(),
    Paths: {
      Quantity: 1,
      Items: [pathToInvalidate],
    },
  },
});

invalidationRequest.send((error, success) => {
  if (error) {
    console.log('ERROR WHILE INVALIDATING RESSOURCES ON CLOUDFRONT');
    console.log('*************');
    console.log(error.message);
    console.log('*************');
    throw error;
  }
  if (success) {
    console.log('INVALIDATION ON CLOUDFRONT SUCCESSFUL');
    console.log('*************');
    console.log(`PATH INVALIDATED: ${pathToInvalidate}`);
    console.log(`INVALIDATION ID : ${success.Invalidation.Id}`);
    console.log('*************');
  }
});
