import moment from 'moment'
import time from 'time'
import { Timezone, MealKey, HHmm } from '../const'
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
      this._timeKey = this._timeString.split(':').slice(0, 2).join(':')
    }
    return this._timeKey
  }

  get dateKey () {
    return this._dateString
  }

  get mealKey () {
    if (!this._mealKey) {
      if (this.isMorning()) {
        this._mealKey = MealKey.Morning
      } else if (this.isLunch()) {
        this._mealKey = MealKey.Lunch
      } else if (this.isDinner()) {
        this._mealKey = MealKey.Dinner
      } else {
        this._mealKey = MealKey.LateNightMeal
      }
    }
    return this._mealKey
  }

  get HHmmss () {
    return this.formattedString.split(' ')[ 1 ]
  }

  /**
   * @returns {boolean}
   */
  isMorning () {
    return this.timeKey >= HHmm.Morning && this.timeKey < HHmm.Lunch
  }

  /**
   * @returns {boolean}
   */
  isLunch () {
    return this.timeKey >= HHmm.Lunch && this.timeKey < HHmm.Dinner
  }

  /**
   * @returns {boolean}
   */
  isDinner () {
    return this.timeKey >= HHmm.Dinner && this.timeKey < HHmm.LateNightMeal
  }

  valueOf () {
    return this.now.valueOf()
  }

  getDate () {
    return this.now
  }

  static initDate () {
    return new Now({ timestamp: 0 })
  }
}
