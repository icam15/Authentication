import { compareSync, hashSync } from "bcrypt";

const SALT = 10;
export const hashedPassword = (password: string) => {
  return hashSync(password, SALT);
};

export const comparePassword = (plainPassword: string, hashed: string) => {
  return compareSync(plainPassword, hashed);
};
