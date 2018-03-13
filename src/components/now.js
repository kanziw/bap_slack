import moment from 'moment'
import { GMT, HHmm, MealKey } from '../const'

const machineTimezoneOffset = new Date().getTimezoneOffset()

/**
 * GMT 에 맞는 현재 시각 정보가 담긴 moment 객체를 반환한다.
 * @param date {number|Date}
 * @param [gmt='+0000'] {string}
 * @returns {Moment}
 */
function getMomentWithGMT (date, gmt = '+0000') {
  const addOrSubtract = gmt[ 0 ] === '+' ? 'add' : 'subtract'
  const num = gmt.slice(1)
  const [ h, m ] = [ num.slice(0, 2), num.slice(2) ].map(str => parseInt(str, 10))
  return moment(date)
    [ addOrSubtract ](h, 'hours')
    [ addOrSubtract ](m, 'minutes')
    .add(machineTimezoneOffset, 'minutes')
}

export default class Now {
  /**
   * @param gmt {string}
   * @param timestamp {?number}
   */
  constructor ({ gmt = GMT, timestamp = null } = {}) {
    this._moment = getMomentWithGMT(timestamp || Date.now(), gmt)
    this.formattedString = this._moment.format('YYYY-MM-DD HH:mm:ss')
    const [ dateString, timeString ] = this.formattedString.split(' ')
    this._dateString = dateString
    this._timeString = timeString
  }

  getDateBeforeHoursOf (num) {
    return this._moment.subtract(num, 'h').toDate()
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
    return this._moment.valueOf()
  }

  getDate () {
    return this._moment.toDate()
  }

  /**
   * 시간의 처음을 표현하고 싶을 때 사용한다. unix timestamp === 0 인 Now 객체를 반환한다.
   * @return {Now}
   */
  static initDate () {
    return new Now({ timestamp: 0 })
  }
}
