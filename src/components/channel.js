export default class Channel {
  /**
   * @param data {ChannelInfo}
   */
  constructor (data) {
    this._d = data
  }

  get id () {
    return this._d.id
  }

  get name () {
    return this._d.name
  }
}

/**
 * @typedef {object} ChannelInfo
 * @property {string} id
 * @property {string} name
 * @property {boolean} is_channel
 * @property {string} created
 * @property {string} creator
 * @property {boolean} is_archived
 * @property {boolean} is_general
 * @property {boolean} has_pins
 * @property {boolean} is_member
 * @property {object} latest
 * @property {string} latest.type
 * @property {string} latest.user
 * @property {string} latest.text
 * @property {string} latest.ts
 * @property {number} unread_count
 * @property {number} unread_count_display
 * @property {Array.<string>} members
 * @property {object} topic
 * @property {string} topic.value
 * @property {string} topic.creator
 * @property {number} topic.last_set
 * @property {object} purpose
 * @property {string} purpose.value
 * @property {string} purpose.creator
 * @property {number} purpose.last_set
 * @property {Array.<string>} previous_names
 */
