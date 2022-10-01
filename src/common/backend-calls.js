const backendURL = "https://localhost:3000";

const backend = {

    resourceBackendURL: 'https://localhost/client-sandbox/',

    getStartingAvatars() {
        const requestPromise = new Promise((resolve, reject) => {
            fetch(backendURL + "/get_starting_avatars", {
                credentials: 'omit',
                mode: 'cors'
            })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                }
                else {
                    console.log(response.status, response.statusText);
                }
            })
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                console.log('Fetch Error :-S', error);
            });
        });

        return requestPromise;
    }
};

export default backend;