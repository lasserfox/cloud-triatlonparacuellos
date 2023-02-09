import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTraining, deleteTraining, getTrainings, patchTraining } from '../api/trainings-api'
import Auth from '../auth/Auth'
import { Training } from '../types/Training'

interface trainingsProps {
  auth: Auth
  history: History
}

interface TrainingsState {
  trainings: Training[]
  newTrainingName: string
  loadingTrainings: boolean
}

export class Trainings extends React.PureComponent<trainingsProps, TrainingsState> {
  state: TrainingsState = {
    trainings: [],
    newTrainingName: '',
    loadingTrainings: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTrainingName: event.target.value })
  }

  onEditButtonClick = (trainingId: string) => {
    this.props.history.push(`/trainings/${trainingId}/edit`)
  }

  onTrainingCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTraining = await createTraining(this.props.auth.getIdToken(), {
        name: this.state.newTrainingName,
        dueDate
      })
      this.setState({
        trainings: [...this.state.trainings, newTraining],
        newTrainingName: ''
      })
    } catch {
      alert('Training creation failed')
    }
  }

  onTrainingDelete = async (trainingId: string) => {
    try {
      await deleteTraining(this.props.auth.getIdToken(), trainingId)
      this.setState({
        trainings: this.state.trainings.filter(training => training.trainingId !== trainingId)
      })
    } catch {
      alert('Training deletion failed')
    }
  }

  onTrainingCheck = async (pos: number) => {
    try {
      const training = this.state.trainings[pos]
      await patchTraining(this.props.auth.getIdToken(), training.trainingId, {
        name: training.name,
        dueDate: training.dueDate,
        done: !training.done
      })
      this.setState({
        trainings: update(this.state.trainings, {
          [pos]: { done: { $set: !training.done } }
        })
      })
    } catch {
      alert('Training deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const trainings = await getTrainings(this.props.auth.getIdToken())
      this.setState({
        trainings,
        loadingTrainings: false
      })
    } catch (e) {
      alert(`Failed to fetch trainings: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Trainings</Header>

        {this.rendercreateTrainingInput()}

        {this.renderTrainings()}
      </div>
    )
  }

  rendercreateTrainingInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New training',
              onClick: this.onTrainingCreate
            }}
            fluid
            actionPosition="left"
            placeholder="insert the training name..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTrainings() {
    if (this.state.loadingTrainings) {
      return this.renderLoading()
    }

    return this.renderTrainingsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Trainings
        </Loader>
      </Grid.Row>
    )
  }

  renderTrainingsList() {
    return (
      <Grid padded>
        {this.state.trainings.map((training, pos) => {
          return (
            <Grid.Row key={training.trainingId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTrainingCheck(pos)}
                  checked={training.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {training.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {training.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(training.trainingId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTrainingDelete(training.trainingId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {training.attachmentUrl && (
                <Image src={training.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
