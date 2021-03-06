export const name = '어제'
/**
 * @param context {Context}
 * @returns {Promise.<void>}
 */
export async function fn (context) {
  context.where(name)
  const user = await context.getUser()

  if (context.shouldResponseYesterday()) {
    const recentlyMenu = await context.getRecentlyMenuOfUser()
    const msg = `${user.markedName}${recentlyMenu
      ? ` : "${recentlyMenu.menu}"`
      : `, 어제는 ${context.mealString}을 먹지 않았어요.`}`

    await context.sendMessage(msg, { user })
  }
}
