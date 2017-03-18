export const name = '주문'
/**
 * @param context {Context}
 * @returns {Promise.<void>}
 */
export async function fn (context) {
  context.where(name)
  if (context.isMessageFromUser()) {
    if (!context.saveMenu()) {
      const user = await context.getUser()
      await context.sendMessage(`주문이 저장되지 않았어요, ${user.markedName}`, { user })
    }
  }
}
