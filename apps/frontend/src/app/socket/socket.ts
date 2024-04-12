import { io } from 'socket.io-client';

function getCookieValue(cookieName: string) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}


const socket = io('http://localhost:5000', {
    auth: {
        token: getCookieValue('username'),
    }
});

export default socket;