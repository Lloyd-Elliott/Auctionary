const getItemById = (itemId) => {
    return fetch(`http://localhost:3333/item/${itemId}`)
        .then((response) => {
            if(response.status === 200){
                return response.json();
            } else {
                throw `Failed to fetch item: This Item May not Exist, Please try another ID`;
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
    
    const session_token = localStorage.getItem('session_token');
    const headers = {};
    if (session_token) {
        headers['X-Authorization'] = session_token;
    }
    
    return fetch(url, { headers })
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
            localStorage.removeItem('user_id');
            localStorage.removeItem('session_token');
            return data;
        })
        .catch((error) => {
            console.error(error);
            localStorage.removeItem('user_id');
            localStorage.removeItem('session_token');
            return Promise.reject(error);
        }); 
}

const createUser = (userData) => {
    return fetch('http://localhost:3333/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })
        .then((response) => {
            if(response.status === 201){
                return response.json();
            } else {
                return response.json().then(err => {
                    throw err.error_message || 'User creation failed';
                });
            }
        })
        .catch((error) => {
            console.error(error);
            return Promise.reject(error);
        }); 
}

const createItem = (itemData) => {
    const session_token = localStorage.getItem('session_token');
    
    if (!session_token) {
        return Promise.reject('Must be logged in to create an item');
    }

    return fetch('http://localhost:3333/item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': session_token
        },
        body: JSON.stringify(itemData)
    })
        .then((response) => {
            if(response.status === 201){
                return response.json();
            } else {
                return response.json().then(err => {
                    throw err.error_message || 'Failed to create item';
                });
            }
        })
        .catch((error) => {
            console.error(error);
            return Promise.reject(error);
        }); 
}

const placeBid = (itemId, amount) => {
    const session_token = localStorage.getItem('session_token');
    
    if (!session_token) {
        return Promise.reject('Must be logged in to place a bid');
    }

    return fetch(`http://localhost:3333/item/${itemId}/bid`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': session_token
        },
        body: JSON.stringify({ amount })
    })
        .then((response) => {
            if(response.status === 201){
                return { success: true };
            } else if(response.status === 400 || response.status === 403 || response.status === 404){
                return response.json().then(err => {
                    throw err.error_message || 'Failed to place bid';
                });
            } else {
                throw 'Failed to place bid';
            }
        })
        .catch((error) => {
            console.error(error);
            return Promise.reject(error);
        }); 
}

const getQuestions = (itemId) => {
    return fetch(`http://localhost:3333/item/${itemId}/question`)
        .then((response) => {
            if(response.status === 200){
                return response.json();
            } else {
                throw `Failed to fetch questions`;
            }
        })
        .catch((error) => {
            console.error(error);
            return Promise.reject(error);
        }); 
}

const askQuestion = (itemId, questionText) => {
    const session_token = localStorage.getItem('session_token');
    
    if (!session_token) {
        return Promise.reject('Must be logged in to ask a question');
    }

    return fetch(`http://localhost:3333/item/${itemId}/question`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': session_token
        },
        body: JSON.stringify({ question_text: questionText })
    })
        .then((response) => {
            if(response.status === 200){
                return response.json();
            } else if(response.status === 400 || response.status === 403 || response.status === 404){
                return response.json().then(err => {
                    throw err.error_message || 'Failed to submit question';
                });
            } else {
                throw 'Failed to submit question';
            }
        })
        .catch((error) => {
            console.error(error);
            return Promise.reject(error);
        }); 
}

const answerQuestion = (questionId, answerText) => {
    const session_token = localStorage.getItem('session_token');
    
    if (!session_token) {
        return Promise.reject('Must be logged in to answer a question');
    }

    return fetch(`http://localhost:3333/question/${questionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': session_token
        },
        body: JSON.stringify({ answer_text: answerText })
    })
        .then((response) => {
            if(response.status === 200){
                return { success: true };
            } else if(response.status === 400 || response.status === 403 || response.status === 404){
                return response.json().then(err => {
                    throw err.error_message || 'Failed to submit answer';
                });
            } else {
                throw 'Failed to submit answer';
            }
        })
        .catch((error) => {
            console.error(error);
            return Promise.reject(error);
        }); 
}

const getBids = (itemId) => {
    return fetch(`http://localhost:3333/item/${itemId}/bid`)
        .then((response) => {
            if(response.status === 200){
                return response.json();
            } else {
                throw `Failed to fetch bids`;
            }
        })
        .catch((error) => {
            console.error(error);
            return Promise.reject(error);
        }); 
}

export const coreServices = {
    getItemById,
    searchItem,
    userLogin,
    userLogout,
    createUser,
    createItem,
    placeBid,
    getQuestions,
    askQuestion,
    answerQuestion,
    getBids,
};
