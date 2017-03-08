import User from '../components/user'

export const name = '주문확인'
/**
 * @param context {Context}
 * @returns {Promise.<void>}
 */
export async function fn (context) {
  context.where(name)
  if (context.isMessageFromUser()) {
    if (context.shouldResponseCheckOrder()) {
      const user = await context.getUser()
      const orderList = context.getOrderList()
      const keys = Object.keys(orderList).filter(key => ![ 'lastCommand', 'createdAt' ].includes(key))
      if (keys.length > 0) {
        const msg = keys
            .map(uid => `${User.convertIdToMarkedName(uid)} 님은 "${orderList[ uid ]}"`)
            .join(', ')
          + ' 을/를 선택했어요.'
        await context.sendMessageToUser(user, msg)
      }
    }
  }
}
