export default function authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.accessToken) {
        // For Spring Boot back-end, the header should be "Authorization: Bearer [token]"
        return { Authorization: 'Bearer ' + user.accessToken };
    } else {
        return {};
    }
}