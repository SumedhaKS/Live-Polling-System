export const useAuth = () => {
    const saveToken = (token: string) => {
        localStorage.setItem("token", token)
    }

    const getToken = () => localStorage.getItem("token")

    const logout = () => localStorage.removeItem("token")

    const isLoggedIn = () => !!getToken()

    return { saveToken, getToken, logout, isLoggedIn }
}
