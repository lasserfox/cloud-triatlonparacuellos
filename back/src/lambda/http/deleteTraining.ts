import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTrainingItem } from '../../business/trainings'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteTraining')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const trainingId = event.pathParameters.trainingId
    // TODO: Remove a TODO item by id
    logger.info('delete1', {'event.pathParameters': event.pathParameters })
    await deleteTrainingItem(event, trainingId)
    logger.info('delete2', {'trainingId': trainingId })
    return {
      statusCode: 204,
      headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // replace with hostname of frontend (CloudFront)
    },
      body: JSON.stringify({})
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
