/** Public folder paths — files live in frontend/public/user-assets */
export const USER_ASSETS = `${process.env.PUBLIC_URL}/user-assets`;

export function userAsset(path) {
  return `${USER_ASSETS}/${path.replace(/^\//, '')}`;
}
