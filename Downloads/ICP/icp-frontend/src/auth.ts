export const getAccess = () => localStorage.getItem("access_token");
export const getRefresh = () => localStorage.getItem("refresh_token");
export const setTokens = (a?: string, r?: string) => {
  if (a) localStorage.setItem("access_token", a);
  if (r) localStorage.setItem("refresh_token", r);
};
export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
