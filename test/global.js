import should from 'should'
global.should = should
import initServer from '../src/server'
import Config from '../src/config'
import { EventEmitter } from 'events'

const PORT = 9999

// Mock SlackBot
class Bot extends EventEmitter {
  constructor () {
    super()
    this.self = { id: 'botId' }
    this.postMessageToUser = async () => ({})
    this.postMessageToChannel = async () => ({})
    this.getUsers = async () => ({})
    this.getChannels = async () => ({})
  }
}

before(async () => {
  const bot = new Bot()
  global.bot = Config.Bot = bot
  Config.PORT = PORT
  const { di } = await initServer(Config)
  global.di = di
})
