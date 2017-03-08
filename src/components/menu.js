export default class Menu {
  constructor (data) {
    this._d = data
  }

  get menu () {
    return this._d.menu
  }
}

/**
 * @typedef {object} DBMenuData
 * @property uid {string}
 * @property mealKey {string}
 * @property menu {string}
 * @property createdAt {Date}
 */
