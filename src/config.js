const env = process.env

export default {
  PORT: parseInt(env.PORT, 10) || 3762,

  // MONGO
  MONGO_HOST: env.MONGO_HOST || '127.0.0.1',
  MONGO_PORT: env.MONGO_PORT || '27017',
  MONGO_DBNAME: 'bap',

  // SLACK
  SLACK_API_TOKEN: env.SLACK_API_TOKEN,
  BOT_NAME: 'bob',
}
