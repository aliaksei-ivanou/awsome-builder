export function authorized(roles, path, method) {
  if (roles.includes("Admin")) {
    console.log(
      `User is authorized: roles: ${roles}, path: ${path}, method: ${method}`
    );
    return true;
  } else {
    console.log(
      `User is not authorized: roles: ${roles}, path: ${path}, method: ${method}`
    );
    return false;
  }
}
