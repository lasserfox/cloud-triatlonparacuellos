import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
const logger = createLogger('getTrainings')

import { getTrainingsForUser as getTrainingsForUser } from '../../business/trainings'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('gettraining1', {'event': event })
    const trainings = await getTrainingsForUser(event)
    logger.info('gettraining2', {'trainings': trainings })
    return {
      statusCode: 200,
      headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // replace with hostname of frontend (CloudFront)
    },
      body: JSON.stringify({
        items: trainings
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
