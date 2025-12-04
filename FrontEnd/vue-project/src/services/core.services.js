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

export const coreServices = {
    getItemById,
};