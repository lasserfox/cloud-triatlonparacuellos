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

import { getAbout } from '../api/trainings-api'
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

export class About extends React.PureComponent<trainingsProps, TrainingsState> {
  state: TrainingsState = {
    trainings: [],
    newTrainingName: '',
    loadingTrainings: true
  }


  async componentDidMount() {
    try {
      const abouts = await getAbout(this.props.auth.getIdToken())

    } catch (e) {
      alert(`Failed to fetch Data: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">About</Header>
      </div>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
