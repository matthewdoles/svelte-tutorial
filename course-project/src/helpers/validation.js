export function notEmpty(val) {
  return val.trim().length === 0;
}

export function isValidEmail(val) {
  return new RegExp('/^S+@S+.S+$/').test(val);
}
