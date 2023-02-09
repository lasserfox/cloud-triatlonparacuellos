import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTrainingRequest } from '../../requests/CreateTrainingRequest'
import { createTraining } from '../../helpers/trainings'

import { createLogger } from '../../utils/logger'
const logger = createLogger('createTraining')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTraining: CreateTrainingRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    logger.info('create1', {'event.body': event.body })
    const newItem = await createTraining(newTraining, event)
    logger.info('create2', {'newItem': newItem })
    return {
      statusCode: 201,
      headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // replace with hostname of frontend (CloudFront)
    },
      body: JSON.stringify({
        item: newItem
      })
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
