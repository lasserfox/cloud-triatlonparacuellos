import { apiEndpoint } from '../config'
import { Training } from '../types/Training';
import { CreateTrainingRequest } from '../types/CreateTrainingRequest';
import Axios from 'axios'
import { UpdateTrainingRequest } from '../types/UpdateTrainingRequest';

export async function getAbout(idToken: string): Promise<Training[]> {
  console.log('Fetching about')

  const response = await Axios.get(`${apiEndpoint}/about`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('about:', response.data)
  return response.data.items
}

export async function getTrainings(idToken: string): Promise<Training[]> {
  console.log('Fetching trainings')

  const response = await Axios.get(`${apiEndpoint}/trainings`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Trainings:', response.data)
  return response.data.items
}

export async function createTraining(
  idToken: string,
  newTraining: CreateTrainingRequest
): Promise<Training> {
  const response = await Axios.post(`${apiEndpoint}/trainings`,  JSON.stringify(newTraining), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchTraining(
  idToken: string,
  trainingId: string,
  updatedTraining: UpdateTrainingRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/trainings/${trainingId}`, JSON.stringify(updatedTraining), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteTraining(
  idToken: string,
  trainingId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/trainings/${trainingId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  trainingId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/trainings/${trainingId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
