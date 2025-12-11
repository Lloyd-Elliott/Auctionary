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

export const coreServices = {
    getItemById,
    searchItem,
};
