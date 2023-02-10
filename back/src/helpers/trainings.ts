import { TrainingAccess } from './trainingsAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TrainingItem } from '../models/TrainingItem'
import { AboutItem } from '../models/AboutItem'
import { CreateTrainingRequest } from '../requests/CreateTrainingRequest'
import { UpdateTrainingRequest } from '../requests/UpdateTrainingRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
import { getUserId } from '../lambda/utils'
import { APIGatewayProxyEvent } from 'aws-lambda'

const trainingAccess = new TrainingAccess()
const logger = createLogger('Trainings')
const attachmentUtils = new AttachmentUtils()

export async function createTraining(
  createTrainingRequest: CreateTrainingRequest,
  event: APIGatewayProxyEvent
): Promise<TrainingItem> {
  const itemId = uuid.v4()
  const userId = getUserId(event)
  logger.info('createTraining')
  return await trainingAccess.createTrainingItem({
    userId: userId,
    trainingId: itemId,
    createdAt: new Date().toISOString(),
    name: createTrainingRequest.name,
    dueDate: createTrainingRequest.dueDate,
    done: false,
    attachmentUrl: null
  })
}

export async function getTrainingsForUser(
  event: APIGatewayProxyEvent
): Promise<TrainingItem[]> {
  const userId = getUserId(event)
  logger.info('createTraining')
  return await trainingAccess.getTrainingsForUser(userId)
}

export async function getAboutForUser(
logger.info('getAboutForUser')
  event: APIGatewayProxyEvent
): Promise<AboutItem[]> {
  const userId = getUserId(event)
  return await trainingAccess.getAboutForUser(userId)
}

export async function trainingItemExists(
  event: APIGatewayProxyEvent,
  trainingItemId: string
): Promise<Boolean> {
  const userId = getUserId(event)
  logger.info('Getting all trainingItems', {'userId': userId })
  return await trainingAccess.trainingItemExists(userId, trainingItemId)
}

export async function createAttachmentPresignedUrl(
  event: APIGatewayProxyEvent,
  trainingItemId: string
): Promise<string> {
  const userId = getUserId(event)

  return await attachmentUtils.getUploadUrl(userId, trainingItemId)
}

export async function deleteTrainingItem(
  event: APIGatewayProxyEvent,
  trainingItemId: string
): Promise<void> {
  const userId = getUserId(event)

  await trainingAccess.deleteTrainingItem(userId, trainingItemId)
}

export async function updateTrainingItem(
  event: APIGatewayProxyEvent,
  trainingItemId: string,
  updateTrainingRequest: UpdateTrainingRequest
): Promise<void> {
  const userId = getUserId(event)

  await trainingAccess.updateTrainingItem(userId, trainingItemId, {
    name: updateTrainingRequest.name,
    dueDate: updateTrainingRequest.dueDate,
    done: updateTrainingRequest.done
  })
}