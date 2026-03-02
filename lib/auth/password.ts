import { compare, hash } from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = (password: string) => {
  return hash(password, SALT_ROUNDS);
};

export const verifyPassword = (password: string, passwordHash: string) => {
  return compare(password, passwordHash);
};
