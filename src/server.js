import path from 'path'
import fs from 'fs'
import SlackBots from 'slackbots'
import { MongoClient } from 'mongodb'
import Context from './context'
import _Config from './config'

async function initServer (Config) {
  // Mongo DB
  const mongoUrl = `mongodb://${Config.MONGO_HOST}:${Config.MONGO_PORT}/${Config.MONGO_DBNAME}`
  const mongo = await MongoClient.connect(mongoUrl)

  const di = {
    getMongoCol: colName => mongo.collection(colName),
  }

  // Load modules
  const commandsDirPath = path.join(__dirname, './commands')
  const commandFiles = fs.readdirSync(commandsDirPath)
  const commands = {}
  commandFiles.forEach(fileName => {
    const filePath = path.join(commandsDirPath, fileName)
    const module = require(filePath)
    if (Array.isArray(module.name)) {
      module.name.forEach(mName => commands[ mName.toLowerCase() ] = module.fn)
    } else {
      commands[ module.name ] = module.fn
    }
  })

  // Slack bot
  const bot = new SlackBots({ token: Config.SLACK_API_TOKEN, name: Config.BOT_NAME })
  const botParam = { as_user: 'true' }
  bot.on('start', function () {
    console.log(`Bot [${bot.self.name}] is ready!`)
  })

  bot.on('message', async function (data) {
    const context = new Context(bot, data, di, { botParam })
    if (context.isMessage() && context.isBotCommand()) {
      const fn = commands[ context.command ]
      if (fn) {
        try {
          await fn(context)
        } catch (ex) {
          console.error('Error raised!')
          console.error(ex)
        }
      }
    }
  })

  bot.on('error', function (...args) {
    console.error('Error detected...')
    args.forEach(arg => console.error(arg))
  })
}

if (require.main === module) {
  initServer(_Config).then(() => {
    console.log(`Server is running.`)
  }).catch(ex => {
    console.error(ex)
    console.error(ex.stack)
  })
}
