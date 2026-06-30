export const jwtConstants = {
  accessTokenSecret:
    process.env.JWT_ACCESS_SECRET ||
    'CHANGE_THIS_ACCESS_SECRET',

  refreshTokenSecret:
    process.env.JWT_REFRESH_SECRET ||
    'CHANGE_THIS_REFRESH_SECRET',

  accessTokenExpiry: '15m',

  refreshTokenExpiry: '7d',
};