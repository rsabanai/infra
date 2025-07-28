import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

const reportServiceDevBucket = new aws.s3.Bucket(
  `gescorpgo-report-service-${pulumi.getStack()}-bucket`,
  {
    bucket: `gescorpgo-report-service-${pulumi.getStack()}-bucket`,
  }
)

// Allow public access to the bucket
const reportServiceDevBucketPublicAccessBlock =
  new aws.s3.BucketPublicAccessBlock(
    'report-service-dev-bucket-public-access-block',
    {
      bucket: reportServiceDevBucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: false,
      ignorePublicAcls: true,
      restrictPublicBuckets: false,
    }
  )

// Create a bucket policy to allow public read of all objects in the "public/" folder
const reportServiceDevBucketPolicy = new aws.s3.BucketPolicy(
  'report-service-dev-bucket-policy',
  {
    bucket: reportServiceDevBucket.bucket,
    policy: pulumi.all([reportServiceDevBucket.bucket]).apply(([bucketName]) =>
      JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/public/*`],
          },
        ],
      })
    ),
  },
  { dependsOn: [reportServiceDevBucketPublicAccessBlock] }
)

const gescorpgoCompressedImagesDevBucket = new aws.s3.Bucket(
  'gescorpgo-compressed-images-dev-bucket',
  {
    bucket: 'gescorpgo-compressed-images-dev-bucket',
  }
)

// Allow public access to the new bucket
const gescorpgoCompressedImagesDevBucketPublicAccessBlock =
  new aws.s3.BucketPublicAccessBlock(
    'gescorpgo-compressed-images-dev-bucket-public-access-block',
    {
      bucket: gescorpgoCompressedImagesDevBucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: false,
      ignorePublicAcls: true,
      restrictPublicBuckets: false,
    }
  )

// Create a bucket policy for the new bucket to allow public read of all objects in the "public/" folder
const gescorpgoCompressedImagesDevBucketPolicy = new aws.s3.BucketPolicy(
  'gescorpgo-compressed-images-dev-bucket-policy',
  {
    bucket: gescorpgoCompressedImagesDevBucket.bucket,
    policy: pulumi
      .all([gescorpgoCompressedImagesDevBucket.bucket])
      .apply(([bucketName]) =>
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/public/*`],
            },
          ],
        })
      ),
  },
  { dependsOn: [gescorpgoCompressedImagesDevBucketPublicAccessBlock] }
)

const devApiGateway = new aws.apigateway.RestApi('DevApiGateway', {
  name: 'DevApiGateway',
  description: 'DEV Api Gateway',
})

new aws.ssm.Parameter('/dev/api-gateway/id', {
  name: '/dev/api-gateway/id',
  type: 'String',
  value: devApiGateway.id,
  overwrite: true,
})

new aws.ssm.Parameter('/dev/api-gateway/root-resource-id', {
  name: '/dev/api-gateway/root-resource-id',
  type: 'String',
  value: devApiGateway.rootResourceId,
  overwrite: true,
})

export const apiGatewayId = devApiGateway.id
export const apiGatewayRootResourceId = devApiGateway.rootResourceId

export const reportServiceDevBucketName = reportServiceDevBucket.bucket
export const gescorpgoCompressedImagesDevBucketName =
  gescorpgoCompressedImagesDevBucket.bucket
