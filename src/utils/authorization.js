export function authorized(roles, path, method) {
  if (roles.includes("Admin")) {
    return true;
  } else {
    return false;
  }
}
