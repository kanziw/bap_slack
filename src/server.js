import path from 'path'
import fs from 'fs'
import SlackBots from 'slackbots'
import debug from 'debug'
import { MongoClient } from 'mongodb'
import Context from './context'
import _Config from './config'
import moment from 'moment'
import now from './components/now'
import { Timezone, MealKey, LunchHHmm, DinnerHHmm, ChannelNameForNoti } from './const'

async function initServer (Config) {
  // Mongo DB
  const mongoUrl = `mongodb://${Config.MONGO_HOST}:${Config.MONGO_PORT}/${Config.MONGO_DBNAME}`
  const mongo = await MongoClient.connect(mongoUrl)

  const di = {
    debug: debug('bap'),
    getMongoCol: colName => mongo.collection(colName),
    lastCommandList: {},
    orderList: {},
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
  const bot = Config.Bot || new SlackBots({ token: Config.SLACK_API_TOKEN, name: Config.BOT_NAME })
  const botParam = { as_user: 'true' }
  bot.on('start', function () {
    console.log(`Bot [${bot.self.name}] is ready!`)
    setInterval(notiOnTime, 1000)
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

  function notiOnTime() {
    const [LunchH, LunchM, LunchS] = LunchHHmm.split(':')
    if ( moment().hours() == LunchH && moment().minutes() == LunchM && moment().seconds() == LunchS ) {
      const channelName = ChannelNameForNoti
      bot.postMessageToChannel(channelName, '야호!! 곧 점심시간입니다!! 메뉴를 선택해주세요!!')
    }
    const now = moment().format("HH:mm:ss")
  }

  return { di }
}

export default initServer

if (require.main === module) {
  initServer(_Config).then(() => {
    console.log(`Server is running.`)
  }).catch(ex => {
    console.error(ex)
    console.error(ex.stack)
  })
}
