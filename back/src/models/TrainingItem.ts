export interface TrainingItem {
  userId: string
  trainingId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
