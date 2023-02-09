import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUpload')

import { createAttachmentPresignedUrl, trainingItemExists } from '../../helpers/trainings'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const trainingId = event.pathParameters.trainingId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    logger.info('validte1', {'trainingId': trainingId })
    const validTrainingId = await trainingItemExists(event, trainingId)
    logger.info('validate2', {'validTrainingId': validTrainingId })
    if (!validTrainingId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Training item does not exist'
        })
      }
    }
    logger.info('upload1')
    const url = await createAttachmentPresignedUrl(event, trainingId)
    logger.info('upload2', {'url': url })
    return {
      statusCode: 200,
      headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // replace with hostname of frontend (CloudFront)
    },
      body: JSON.stringify({ uploadUrl: url })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
