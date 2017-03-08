export const name = '어제'
export async function fn (context) {
  context.where(name)
  if (context.isMessageFromUser()) {
    const user = await context.getUserInfo(context.uid)

    // Logic with DB
    const lastLunchMenu = null
    const markedName = `<@${user.id}>`
    const msg = lastLunchMenu ? `${markedName} : "${lastLunchMenu}"` : `${markedName}, 어제는 점심을 먹지 않았어요.`
    await context.sendMessageToUser(user, msg)
  }
}
