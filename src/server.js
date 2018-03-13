import path from 'path'
import fs from 'fs'
import SlackBots from 'slackbots'
import debug from 'debug'
import { MongoClient } from 'mongodb'
import Context from './context'
import _Config from './config'
import Now from './components/now'
import { ChannelNameForNoti, DinnerHHmmss, LunchHHmmss } from './const'

async function initServer (Config) {
  // Mongo DB
  const mongoUrl = `mongodb://${Config.MONGO_HOST}:${Config.MONGO_PORT}/${Config.MONGO_DBNAME}`
  const mongo = await MongoClient.connect(mongoUrl)

  const di = {
    debug: debug('bap:live'),
    debugDev: debug('bap:dev'),
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
    di.debugDev(`> data observed : ${JSON.stringify(data)}`)
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

  function notiOnTime () {
    const now = new Now()
    di.debugDev(`> now's HHmmss : ${now.HHmmss}`)
    if (Config.ENABLE_NOTI_LUNCH && now.HHmmss === LunchHHmmss) {
      const lunchMsg = '야호!! 곧 점심시간입니다!! 메뉴를 선택해주세요!!'
      bot.postMessageToChannel(ChannelNameForNoti, lunchMsg)
      di.debug(`__#${ChannelNameForNoti} : ${lunchMsg}`)
    }
    if (Config.ENABLE_NOTI_DINNER && now.HHmmss === DinnerHHmmss) {
      const dinnerMsg = '야호!! 곧 저녁시간입니다!! 메뉴를 선택해주세요!!'
      bot.postMessageToChannel(ChannelNameForNoti, dinnerMsg)
      di.debug(`__#${ChannelNameForNoti} : ${dinnerMsg}`)
    }
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
