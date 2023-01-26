export function timeout(delay) {
  return new Promise((res) => setTimeout(res, delay));
}
