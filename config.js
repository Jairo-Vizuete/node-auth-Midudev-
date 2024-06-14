export const {
  PORT = 3000,
  SALT_ROUNDS = 10,
  SECRET_KEY = "this-is-an-awesome-secret-key", // This secret key must have hash and a lot of things!
} = process.env;
