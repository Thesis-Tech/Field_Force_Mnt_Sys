module.exports = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'default_access_token_secret_64_chars_at_least_random_string',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_token_secret_64_chars_at_least_random_string',
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
};

