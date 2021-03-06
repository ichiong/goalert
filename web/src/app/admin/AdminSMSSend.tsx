import React, { useState } from 'react'
import { Form } from '../forms'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  makeStyles,
} from '@material-ui/core'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import gql from 'graphql-tag'
import { useMutation } from 'react-apollo'
import { useConfigValue } from '../util/RequireConfig'
import { AppLink } from '../util/AppLink'
import LoadingButton from '../loading/components/LoadingButton'
import DialogContentError from '../dialogs/components/DialogContentError'

const sendSMSMutation = gql`
  mutation DebugSendSMS($input: DebugSendSMSInput!) {
    debugSendSMS(input: $input) {
      id
      providerURL
    }
  }
`

const useStyles = makeStyles({
  twilioLink: {
    display: 'flex',
    alignItems: 'center',
  },
})

export default function AdminSMSSend(): JSX.Element {
  const classes = useStyles()
  const [cfgFromNumber] = useConfigValue('Twilio.FromNumber')
  const [fromNumber, setFromNumber] = useState(cfgFromNumber.replace(/^\+/, ''))
  const [toNumber, setToNumber] = useState('')
  const [body, setBody] = useState('')
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  const [send, sendStatus] = useMutation(sendSMSMutation, {
    variables: {
      input: {
        from: '+' + fromNumber,
        to: '+' + toNumber,
        body,
      },
    },
    onError: () => setShowErrorDialog(true),
  })

  return (
    <React.Fragment>
      <Form>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={12} lg={6}>
                <TextField
                  onChange={(e) =>
                    setFromNumber(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  value={fromNumber}
                  fullWidth
                  label='From Number'
                  helperText='Please provide your country code e.g. +1 (USA)'
                  type='tel'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position='start'
                        style={{ marginBottom: '0.1em' }}
                      >
                        +
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={6}>
                <TextField
                  onChange={(e) =>
                    setToNumber(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  value={toNumber}
                  fullWidth
                  label='To Number'
                  helperText='Please provide your country code e.g. +1 (USA)'
                  type='tel'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position='start'
                        style={{ marginBottom: '0.1em' }}
                      >
                        +
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  onChange={(e) => setBody(e.target.value)}
                  value={body}
                  fullWidth
                  label='Body'
                  InputLabelProps={{
                    shrink: true,
                  }}
                  multiline
                />
              </Grid>
            </Grid>
          </CardContent>

          <CardActions>
            <LoadingButton
              buttonText='Send'
              onClick={() => {
                send()
              }}
              loading={sendStatus.loading}
            />
            {sendStatus.data?.debugSendSMS && (
              <AppLink to={sendStatus.data.debugSendSMS.providerURL} newTab>
                <div className={classes.twilioLink}>
                  <Typography>Open in Twilio&nbsp;</Typography>
                  <OpenInNewIcon fontSize='small' />
                </div>
              </AppLink>
            )}
          </CardActions>
        </Card>
      </Form>

      <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)}>
        <DialogTitle>An error occurred</DialogTitle>
        <DialogContentError error={sendStatus.error?.message ?? ''} />
        <DialogActions>
          <Button
            color='primary'
            variant='contained'
            onClick={() => setShowErrorDialog(false)}
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
