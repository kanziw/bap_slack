export const name = '주문'
/**
 * @param context {Context}
 * @returns {Promise.<void>}
 */
export async function fn (context) {
  context.where(name)
  if (context.isMessageFromUser()) {
    context.saveMenu()
  }
}
