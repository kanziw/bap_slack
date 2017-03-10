export const name = '주문완료'
/**
 * @param context {Context}
 * @returns {Promise.<void>}
 */
export async function fn (context) {
  context.where(name)
  if (context.isMessageFromUser()) {
    const orderList = context.getOrderList()
    const uids = Object.keys(orderList).filter(key => ![ 'lastCommand', 'createdAt' ].includes(key))
    if (uids.length > 0) {
      await Promise.all(uids.map(uid => context.saveMenuOfUser(uid, orderList[ uid ])))
      context.removeOrderList()
    } else {
      await context.sendMessage(`저장 할 주문 내역이 존재하지 않습니다.`)
    }
  }
}
