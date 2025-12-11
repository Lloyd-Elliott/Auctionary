const getItemById = (itemId) => {
    return fetch(`http://localhost:3333/item/${itemId}`)
        .then((response) => {
            if(response.status === 200){
                return response.json();
            } else {
                throw `Failed to fetch item: ${response.status}`;
            }
        })
        .then((resJson) => {
            return resJson;
        })
        .catch((error) => {
            console.error(error);
            return Promise.reject(error);
        }); 
}

const searchItem = (queryParams = {}) => {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `http://localhost:3333/search?${queryString}` : 'http://localhost:3333/search';
    
    return fetch(url)
        .then((response) => {
            if(response.status === 200){
                return response.json();
            } else {
                throw `Failed to search items: ${response.status}`;
            }
        })
        .then((resJson) => {
            return resJson;
        })
        .catch((error) => {
            console.error(error);
            return Promise.reject(error);
        }); 
}

const userLogin = (email, password) => {
    return fetch('http://localhost:3333/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    })
        .then((response) => {
            if(response.status === 200){
                return response.json();
            } else if(response.status === 400){
                throw 'Invalid email or password';
            }else {
                return response.json().then(err => {
                    throw err.error_message || 'Login failed';
                });
            }
        })
        .then((data) => {
            // Store user session
            localStorage.setItem('user_id', data.user_id);
            localStorage.setItem('session_token', data.session_token);
            return data;
        })
        .catch((error) => {
            console.error(error);
            return Promise.reject(error);
        }); 
}

const userLogout = () => {
    const session_token = localStorage.getItem('session_token');
    
    if (!session_token) {
        return Promise.reject('No active session');
    }

    return fetch('http://localhost:3333/logout', {
        method: 'POST',
        headers: {
            'X-Authorization': session_token,
        }
    })
        .then((response) => {
            if(response.status === 200){
                return response.json();
            } else {
                return response.json().then(err => {
                    throw err.error || 'Logout failed';
                });
            }
        })
        .then((data) => {
            // Clear user session
            localStorage.removeItem('user_id');
            localStorage.removeItem('session_token');
            return data;
        })
        .catch((error) => {
            console.error(error);
            // Clear local storage even if API call fails
            localStorage.removeItem('user_id');
            localStorage.removeItem('session_token');
            return Promise.reject(error);
        }); 
}

export const coreServices = {
    getItemById,
    searchItem,
    userLogin,
    userLogout,
};
