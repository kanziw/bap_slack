import moment from 'moment'
import time from 'time'
import { Timezone, MealKey, LunchHHmm, DinnerHHmm } from '../const'
time(Date)

export default class Now {
  /**
   * @param [options] {object}
   * @config timezone {string}
   * @config timestamp {number}
   */
  constructor (options = {}) {
    this.now = (options.hasOwnProperty('timestamp') ? new Date(options.timestamp) : new Date()).setTimezone(options.timezone || Timezone)
    this.formattedString = moment(this.now).format('YYYY-MM-DD HH:mm:ss')
    const [ dateString, timeString ] = this.formattedString.split(' ')
    this._dateString = dateString
    this._timeString = timeString
  }

  getDateBeforeHoursOf (num) {
    return moment(this.now).subtract(num, 'h').toDate()
  }

  get mealString () {
    return this.isMorning() ? '아침' : (this.isLunch() ? '점심' : '저녁')
  }

  get timeKey () {
    if (!this._timeKey) {
      const timeKey = this._timeString.split(':').slice(0, 2).join(':')
      this._timeKey = timeKey
      return timeKey
    }
  }

  get dateKey () {
    return this._dateString
  }

  get mealKey () {
    if (!this._mealKey) {
      this._mealKey = this.isMorning() ? MealKey.Morning : (this.isLunch() ? MealKey.Lunch : MealKey.Dinner)
    }
    return this._mealKey
  }

  get hours() {
    return moment(this.now).format('HH')
  }

  get minutes() {
    return moment(this.now).format('mm')
  }

  get seconds() {
    return moment(this.now).format('ss')
  }

  /**
   * @returns {boolean}
   */
  isMorning () {
    return this.timeKey < LunchHHmm
  }

  /**
   * @returns {boolean}
   */
  isLunch () {
    return !this.isMorning() && this.timeKey < DinnerHHmm
  }

  /**
   * @returns {boolean}
   */
  isDinner () {
    return !this.isLunch()
  }

  valueOf () {
    return this.now.valueOf()
  }

  static initDate () {
    return new Now({ timestamp: 0 })
  }
}
