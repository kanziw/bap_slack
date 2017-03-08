export default class User {
  /**
   * @param data {UserInfo}
   */
  constructor (data) {
    this._d = data
  }

  get id () {
    return this._d.id
  }

  get markedName () {
    return `<@${this.id}>`
  }
}

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
