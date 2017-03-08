export default class Context {
  /**
   * @param bot {Bot}
   * @param data {object}
   * @param [options] {object}
   */
  constructor (bot, data, options = {}) {
    this._bot = bot
    this._d = data
    this._botParam = options.botParam || { as_user: true }

    this.command = null
    this.args = null
    this._members = null
  }

  get tid () {
    return this._d.team
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

  /**
   * @param uid {string}
   * @returns {Promise.<UserInfo>}
   */
  async getUserInfo (uid) {
    this.ensure(uid)
    let members = this._members
    if (!members) {
      members = await this._bot.getUsers().then(r => r.members)
    }
    const user = members.find(member => member.id === this.uid)
    this.ensure(user)
    return user
  }

  sendMessageToUser (user, msg) {
    return this._bot.postMessageToUser(user.name, msg, this._botParam)
  }

  ensure (condition, errorCode) {
    if (!condition) {
      this.assert(errorCode)
    }
  }

  assert (errorCode) {
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

//
// User info
//
/**
 * @typedef {object} UserInfo
 * @property {string} id
 * @property {string} team_id
 * @property {string} name
 * @property {boolean} deleted
 * @property {?string} status
 * @property {string} color
 * @property {string} real_name
 * @property {string} tz
 * @property {string} tz_label
 * @property {number} tz_offset
 * @property {object} profile
 * @property {string} profile.first_name
 * @property {string} profile.last_name
 * @property {string} profile.avatar_hash
 * @property {string} profile.real_name
 * @property {string} profile.real_name_normalized
 * @property {string} profile.email
 * @property {string} profile.image_24
 * @property {string} profile.image_32
 * @property {string} profile.image_48
 * @property {string} profile.image_72
 * @property {string} profile.image_192
 * @property {string} profile.image_512
 * @property {?string} profile.fields: null },
 * @property {boolean} is_admin
 * @property {boolean} is_owner
 * @property {boolean} is_primary_owner
 * @property {boolean} is_restricted
 * @property {boolean} is_ultra_restricted
 * @property {boolean} is_bot
 * @property {string} presence
 */
