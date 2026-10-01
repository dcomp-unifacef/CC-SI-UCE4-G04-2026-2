export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },
};