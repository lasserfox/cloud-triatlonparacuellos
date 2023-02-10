import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { trainingItemExists, updateTrainingItem } from '../../helpers/trainings'
import { UpdateTrainingRequest } from '../../requests/UpdateTrainingRequest'

import { createLogger } from '../../utils/logger'
const logger = createLogger('updateTraining')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const trainingId = event.pathParameters.trainingId
    const updatedTraining: UpdateTrainingRequest = JSON.parse(event.body)
    logger.info('update1', {'trainingId': trainingId,'updatedTraining': updatedTraining })

    // TODO: Update a TODO item with the provided id using values in the "updatedTraining" object
    const validTrainingId = await trainingItemExists(event, trainingId)
   logger.info('update2', {'isvalid': validTrainingId })
    if (!validTrainingId) {
      return {
        statusCode: 404,
        headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // replace with hostname of frontend (CloudFront)
    },
        body: JSON.stringify({
          error: 'Training item does not exist'
        })
      }
    }

    await updateTrainingItem(event, trainingId, updatedTraining)
    logger.info('update3')
     return {
      statusCode: 200,
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
