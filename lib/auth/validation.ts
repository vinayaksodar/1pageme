const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isValidEmail = (email: string) => EMAIL_REGEX.test(email);

export const MIN_PASSWORD_LENGTH = 8;
export const isValidPassword = (password: string) =>
  password.length >= MIN_PASSWORD_LENGTH;
