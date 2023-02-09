/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateTrainingRequest {
  name: string
  dueDate: string
  done: boolean
}