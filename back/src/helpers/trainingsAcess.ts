import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TrainingItem } from '../models/TrainingItem'
import { AboutItem } from '../models/AboutItem'
import { TrainingUpdate } from '../models/TrainingUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TrainingsAccess')

// TODO: Implement the dataLayer logic
export class TrainingAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly trainingsTable = process.env.TRAININGS_TABLE
  ) {}

  async getAboutForUser(userId: string): Promise<AboutItem[]> {
  const logger = createLogger('getAboutForUser query')
    const result = await this.docClient
      .query({
        TableName: this.trainingsTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()
    const logger = createLogger('result',{'result':result.Items})
    const items = result.Items
    return items as TrainingItem[]
  }

  async getTrainingsForUser(userId: string): Promise<TrainingItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.trainingsTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items
    return items as TrainingItem[]
  }

  async createTrainingItem(trainingItem: TrainingItem): Promise<TrainingItem> {
  logger.info('createTrainingItem', {'trainingItem': trainingItem })
    await this.docClient
      .put({
        TableName: this.trainingsTable,
        Item: trainingItem
      })
      .promise()

    return trainingItem
  }

  async getTrainingItem(userId: string, trainingItemId: string)  {
  logger.info('getTrainingItem', {'userId': userId,'trainingItemId': trainingItemId })
    const result = await this.docClient
      .get({
        TableName: this.trainingsTable,
        Key: {
          trainingId: trainingItemId,
          userId
        }
      })
      .promise()

    return result.Item
  }

  async trainingItemExists(
    userId: string,
    trainingItemId: string
  ): Promise<Boolean> {
    const trainingItem = await this.getTrainingItem(userId, trainingItemId)

    return !!trainingItem
  }

  async deleteTrainingItem(userId: string, trainingItemId: string): Promise<void>  {
  logger.info('deleteTrainingItem', {'userId': userId,'trainingItemId': trainingItemId })
    await this.docClient
      .delete({
        TableName: this.trainingsTable,
        Key: {
          trainingId: trainingItemId,
          userId
        }
      })
      .promise()
  }

  async updateTrainingItem(userId: string, trainingItemId: string, updatedTrainingItem: TrainingUpdate): Promise<void> {
  logger.info('updateTrainingItem', {'userId': userId,'trainingItemId': trainingItemId })
    await this.docClient.update({
      TableName: this.trainingsTable,
      Key: {
        trainingId: trainingItemId,
        userId
      },
      ExpressionAttributeNames: {
        '#N': 'name'
      },
      UpdateExpression: 'SET #N = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': updatedTrainingItem.name,
        ':dueDate': updatedTrainingItem.dueDate,
        ':done': updatedTrainingItem.done
      }
    }).promise()
  }

  async updateAttachmentUrl(userId: string, trainingItemId: string, bucketName: string): Promise<void> {
  logger.info('updateAttachmentUrl', {'userId': userId,'trainingItemId': trainingItemId, 'bucketName': bucketName })
    await this.docClient.update({
      TableName: this.trainingsTable,
      Key: {
        trainingId: trainingItemId,
        userId
      },
      UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${trainingItemId}`
      }
    }).promise()
  }
}

function createDynamoDBClient() {
logger.info('createDynamoDBClient')
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}