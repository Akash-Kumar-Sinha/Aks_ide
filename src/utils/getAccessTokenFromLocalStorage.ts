export const getAccessTokenFromLocalStorage = () => {
    return localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_NAME);
}