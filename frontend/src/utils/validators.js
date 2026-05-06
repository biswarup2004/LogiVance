const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return emailRegex.test(email.trim());
}

export function minLength(value, length) {
  return value.trim().length >= length;
}
