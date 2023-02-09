import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
import { TrainingAccess } from './trainingsAcess'

export class AttachmentUtils {
  constructor(
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly s3Client = new XAWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly trainingAccess = new TrainingAccess()
  ) {}

  async getUploadUrl(userId: string, trainingItemId: string) {
    const preSignedUrl = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: trainingItemId,
      Expires: parseInt(this.urlExpiration)
    })

    await this.trainingAccess.updateAttachmentUrl(userId, trainingItemId, this.bucketName)

    return preSignedUrl
  }
}
