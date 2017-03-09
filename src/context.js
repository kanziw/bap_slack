/* global debug */
import User from './components/user'
import Channel from './components/channel'
import Now from './components/now'
import Menu from './components/menu'

export default class Context {
  /**
   * @param bot {Bot}
   * @param data {object}
   * @param di {object}
   * @param [options] {object}
   */
  constructor (bot, data, di, options = {}) {
    this._bot = bot
    this._d = data
    this._di = di
    this._botParam = options.botParam || { as_user: true }

    this.command = null
    this.args = null
    this._members = null
    this._channels = null

    this.now = new Now()
  }

  get cid () {
    return this._d.channel
  }

  get tid () {
    return this._d.team
  }

  get collectionName () {
    this.ensure(this.tid)
    return this.tid
  }

  get uid () {
    return this._d.user
  }

  get botId () {
    return this._bot.self.id
  }

  where (name) {
    this._where = name
  }

  isMessage () {
    return this._d.type === 'message'
  }

  isBotCommand () {
    if (this.isCalledBot()) {
      return this._d.text.split(' ')[ 0 ] === `<@${this.botId}>`
    }
    return false
  }

  isCalledBot () {
    if (this._d.text) {
      const split = this._d.text.split(' ')
      const isTrue = !!split.find(v => v === `<@${this.botId}>`)
      if (isTrue) {
        this.command = split[ 1 ]
        this.args = split.slice(2)
      }

      return isTrue
    }
    return false
  }

  isMessageFromUser () {
    return !!this.uid
  }

  isMessageFromChannel () {
    return !!this.cid
  }

  /**
   * @param [uid] {string}
   * @returns {Promise.<User>}
   */
  async getUser (uid = this.uid) {
    this.ensure(uid)
    if (!this._members) {
      this._members = await this._bot.getUsers().then(r => r.members)
    }
    const user = this._members.find(member => member.id === this.uid)
    this.ensure(user)
    return new User(user)
  }

  /**
   * {user.id} 가 최근 12시간 이내에 주문한 {mealKey} Menu Data 조회
   * @param [uid] {string}
   * @returns {Promise.<?Menu>}
   */
  async getRecentlyMenuOfUser (uid = this.uid) {
    this.ensure(uid)
    const col = this._di.getMongoCol(this.collectionName)
    const q = { uid, mealKey: this.mealKey, createdAt: { $gt: this.now.getDateBeforeHoursOf(12) } }
    const [ yesterdayData ] = await col.find(q).sort({ createdAt: -1 }).limit(1).toArray()
    return yesterdayData ? new Menu(yesterdayData) : null
  }

  get mealKey () {
    return this.now.mealKey
  }

  get mealString () {
    return this.now.mealString
  }

  /**
   * 들어온 주문을 저장한다.
   */
  saveMenu () {
    this.ensure(this.uid && this.tid)
    const { orderList } = this._di
    const key = this.orderListKey
    if (!orderList[ key ]) {
      orderList[ key ] = { createdAt: this.now }
    }
    orderList[ key ][ this.uid ] = this.args.join(' ')
    orderList[ key ].lastCommand = new Date(0)
  }

  get orderListKey () {
    return `${this.tid}_${this.mealKey}`
  }

  getOrderList () {
    return this._di.orderList[ this.orderListKey ] || { lastCommand: Now.initDate() }
  }

  updateOrderListCommandHistory () {
    this._di.orderList[ this.orderListKey ] = Object.assign({}, this.getOrderList(), { lastCommand: this.now })
  }

  shouldResponseCheckOrder () {
    const { lastCommandList } = this._di
    this.ensure(this.tid, this.uid, lastCommandList)
    const key = `checkOrder_${this.tid}`

    const orderList = this.getOrderList()
    const milliSecondForHour = 1000 * 60 * 60
    const shouldResponse = orderList.lastCommand.valueOf() + milliSecondForHour <= this.now.valueOf()
    if (shouldResponse) {
      this.updateOrderListCommandHistory()
    } else {
      this._di.debug(`Duplicated check order, last request : ${orderList.lastCommand.formattedString} / now : ${this.now.formattedString}`)
    }
    return shouldResponse
  }

  shouldResponseYesterday () {
    const { lastCommandList } = this._di
    this.ensure(this.tid, this.uid, lastCommandList)
    const key = `yesterday_${this.tid}_${this.uid}`
    if (!lastCommandList[ key ]) {
      lastCommandList[ key ] = { uid: this.uid, lastCommand: Now.initDate() }
    }
    const milliSecondForHour = 1000 * 60 * 60
    const shouldResponse = lastCommandList[ key ].lastCommand.valueOf() + milliSecondForHour <= this.now.valueOf()
    if (shouldResponse) {
      lastCommandList[ key ].lastCommand = this.now
    } else {
      this._di.debug(`Duplicated yesterday command, last request : ${lastCommandList[ key ].lastCommand.formattedString} / now : ${this.now.formattedString}`)
    }
    return shouldResponse
  }

  async sendMessage (msg, options = {}) {
    let success = false
    if (this.isMessageFromChannel()) {
      const channel = await this.getChannel()
      if (channel) {
        await this.sendMessageToChannel(channel, msg)
        success = true
      }
    }

    if (!success && this.isMessageFromUser()) {
      let user = options.user
      if (!user) {
        user = await this.getUser()
      }
      await this.sendMessageToUser(user, msg)
    }
  }

  sendMessageToUser (user, msg) {
    this._di.debug(`[${user.name}] : ${msg}`)
    return this._bot.postMessageToUser(user.name, msg, this._botParam, null)
  }

  /**
   * @param [cid] {string}
   * @returns {Promise.<?Channel>}
   */
  async getChannel (cid = this.cid) {
    this.ensure(cid)
    if (!this._channels) {
      this._channels = await this._bot.getChannels().then(r => r.channels)
    }
    const channel = this._channels.find(channel => channel.id === this.cid)
    return channel ? new Channel(channel) : null
  }

  /**
   * @param channel {Channel}
   * @param msg {string}
   */
  sendMessageToChannel (channel, msg) {
    this._di.debug(`[${channel.name}] : ${msg}`)
    return this._bot.postMessageToChannel(channel.name, msg, this._botParam, null)
  }

  ensure (condition, errorCode) {
    if (!condition) {
      this.assert(errorCode).then()
    }
  }

  async assert (errorCode) {
    if (this.uid) {
      try {
        const user = await this.getUser()
        await this.sendMessageToUser(user, `Failed..`)
      } catch (ex) {
        console.error('Unknown error detected...')
        console.error(ex)
      }
    }
    const err = new Error()
    err.errorCode = errorCode
    err.handled = true
    err.teamId = this.tid
    err.userId = this.uid
    err.where = this._where
    throw err
  }
}

//
// Examples of data
//

/**
 * { type: 'hello' }
 */

/**
 * { type: 'presence_change',
  presence: 'active',
  user: 'USER_ID' }
 */

/**
 * { type: 'reconnect_url',
  url: 'wss://mpmulti-kl7r.slack-msgs.com/websocket/...' }
 */

/**
 * { type: 'presence_change',
  presence: 'active',
  user: 'USER_ID' }
 */

/**
 * { type: 'user_typing', channel: 'CHANNEL_ID', user: 'USER_ID' }
 */

/**
 * { type: 'message',
  channel: 'CHANNEL_ID',
  user: 'USER_ID',
  text: '<@U4EJYT8Q4> 안녕',
  ts: '1488956218.000004',
  team: 'TEAM_ID' }
 */

/**
 * { type: 'desktop_notification',
  title: 'XXXX',
  subtitle: 'XXXX',
  msg: '1488956218.000004',
  content: '@bob 안녕',
  channel: 'CHANNEL_ID',
  launchUri: 'slack://channel?id=CHANNEL_ID&message=xxxxxxxxxxxxxx&team=TEAM_ID',
  avatarImage: 'https://secure.gravatar.com/avatar/...jpg',
  ssbFilename: 'knock_brush.mp3',
  imageUri: null,
  is_shared: false,
  event_ts: '1488956218.416189' }
 */

/**
 * { type: 'message',
  user: 'USER_ID',
  text: 'Hello, World.',
  bot_id: 'BOT_ID',
  team: 'TEAM_ID',
  channel: 'CHANNEL_ID',
  ts: '1488956218.000005' }
 */

