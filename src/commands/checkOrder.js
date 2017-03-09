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
        const msg = keys.map(uid => `${User.convertIdToMarkedName(uid)} : "${orderList[ uid ]}"`).join('\n')
        await context.sendMessage(msg, { user })
      } else {
        await context.sendMessage('주문 내역이 없습니다.', { user })
      }
    }
  }
}
