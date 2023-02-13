import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
const logger = createLogger('getAbout')

import { getAboutForUser } from '../../business/trainings'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('about', {'event': event })
    const aboutData = await getAboutForUser(event)
    return {
      statusCode: 200,
      headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // replace with hostname of frontend (CloudFront)
    },
      body: JSON.stringify({
        items: aboutData
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
