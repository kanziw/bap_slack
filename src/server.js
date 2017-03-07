import express from 'express'
import bodyParser from 'body-parser'
import { IncomingWebhook, WebClient, RtmClient, CLIENT_EVENTS } from '@slack/client'
import { MongoClient } from 'mongodb'

import _Config from './config'

async function initServer (Config) {
  // Mongo DB
  const mongoUrl = `mongodb://${Config.MONGO_HOST}:${Config.MONGO_PORT}/${Config.MONGO_DBNAME}`
  const mongo = await MongoClient.connect(mongoUrl)

  // IncomingWebhook
  const webhook = new IncomingWebhook(Config.SLACK_WEBHOOK_URL)

  // Web API
  const web = new WebClient(Config.SLACK_API_TOKEN)

  // Real-Time Messaging API
  const rtm = new RtmClient(Config.SLACK_BOT_TOKEN)
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
  })

  // you need to wait for the client to fully connect before you can send messages
  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    console.log('HELLO!!!')
    // rtm.sendMessage('Hello! /w RTM', 'D3SPKHGFJ');
  })
  rtm.start();

  const di = {
    mongoBap: mongo.collection('bap'),
  }

  // Web server with Express
  const app = express()
  app.use(bodyParser.urlencoded({ extended: true }))
  app.post('/slack/bap', async function (req, res, next) {
    // console.log(34, await di.mongoBap.find({}).toArray())

    // IncomingWebhook
    const ret = await new Promise((resolve, reject) => {
      webhook.send('Hello there /w Webhook', (err, res) => err ? reject(err) : resolve(err))
    }).catch(ex => console.log('Error:', ex));
    console.log('Message sent /w Webhook: ', ret);

    // Web API
    const ret2 = await new Promise((resolve, reject) => {
      web.chat.postMessage('C123456', 'Hello there, /w Web API', (err, res) => err ? reject(err) : resolve(err))
    }).catch(ex => console.log('Error:', ex));
    console.log('Message sent /w Web API: ', ret2)

    // console.log(54, req.body)

    /*  req.body example
     {
     token: SLACK_TOKEN (USER OWN),
     team_id: SLACK_CONFIGURATION,
     team_domain: SLACK_CONFIGURATION,
     channel_id: SLACK_CONFIGURATION,
     channel_name: 'bap',
     user_id: SLACK_CONFIGURATION,
     user_name: SLACK_CONFIGURATION,
     command: '/bap',
     text: COMMAND_ARGUMENTS,
     response_url: SLACK_CONFIGURATION
     }
     */
    res.json({
      'text': 'I am a test message http://slack.com',
      'attachments': [
        {
          'text': `And here's an attachment!'`,
        },
      ],
    })
    next()
  })

  // error handler
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(400).send(err.message)
    next(err)
  })

  app.listen(Config.PORT)
  console.log(`Server start PORT : ${Config.PORT}`)
}

if (require.main === module) {
  initServer(_Config).then(() => {
    console.log(`Server is running.`)
  }).catch(ex => {
    console.error(ex)
    console.error(ex.stack)
  })
}
