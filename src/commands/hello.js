export const name = [ '안녕', 'hi', 'hello' ]
export async function fn (context) {
  context.where(name)
  if (context.isMessageFromUser()) {
    const user = await context.getUserInfo(context.uid)
    await context.sendMessageToUser(user, `Hello, ${user.name}.`)
  }
}
