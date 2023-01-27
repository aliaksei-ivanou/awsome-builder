const checkAuthorization = (roles, path, method) => {
  if (roles.includes("Admin")) {
    return true;
  }
  return false;
};

export const authorized = (roles, path, method) => {
  const isAuthorized = checkAuthorization(roles, path, method);
  if (isAuthorized) {
    console.log(
      `User is authorized: roles: ${roles}, path: ${path}, method: ${method}`
    );
  } else {
    console.log(
      `User is not authorized: roles: ${roles}, path: ${path}, method: ${method}`
    );
  }
  return isAuthorized;
};
