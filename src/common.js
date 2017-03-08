import moment from 'moment'
import { LocalOffset, LunchHHmm, DinnerHHmm } from './const'

const timezoneOffset = new Date().getTimezoneOffset()

const getUTCDate = () => moment().add(timezoneOffset, 'm')
const getLocalDate = () => getUTCDate().add(LocalOffset, 'h')
const getLocalDateString = getLocalDate().format('YYYY-MM-DD HH:mm:ss')
const getDateKey = () => getLocalDateString().split(' ')[ 0 ]
const getTimeKey = () => getLocalDateString().split(' ')[ 1 ]

export const isNow = {
  timeKey: getTimeKey().split(':').slice(0, 2).join(':'),
  /**
   * @returns {boolean}
   */
  Morning: function () {
    return this.timeKey < LunchHHmm
  },
  /**
   * @returns {boolean}
   */
  Lunch: function () {
    return !this.Morning() && this.timeKey < DinnerHHmm
  },
  /**
   * @returns {boolean}
   */
  Dinner: function () {
    return !this.Lunch()
  },
}
