const backendURL = "https://localhost:3000";
const resourceBackendURL = 'https://localhost/resources/';

function endpoint_url(name, queryString = '') {
    return name + '?platform=twitch' + queryString;
}

async function backendCall(endpoint, method='GET', payload = null) {
    const headers = {}
    let body = '';

    const fetchOptions = {
        credentials: 'omit',
        mode: 'cors',
        method: method
    }

    if(payload) {
        body = JSON.stringify(payload);
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = new Blob([body]).size;
        fetchOptions.body = body;
    }

    fetchOptions.headers = headers;
    const response = await fetch(backendURL + endpoint, fetchOptions);
    const data = await response.json();

    if(response.status != 200) {
        throw data;
    }

    return data;
}
const backend = {
    getResourceURL(name) {
        return resourceBackendURL + name;
    },

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
                    reject(response.statusText);
                }
            })
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                console.log('Fetch Error :-S', error);
                reject(error);
            });
        });

        return requestPromise;
    },

    createNewPlayer(name, playerId, avatar) {
        return backendCall(endpoint_url('/create_new_player'), 'PUT', {name: name, playerId: playerId, avatar: avatar});
    },

    getPlayer(playerId) {
        return backendCall(endpoint_url('/get_player', '&playerId=' + playerId));
    },

    joinGame(playerId) {
        return backendCall(endpoint_url('/join_game', '&playerId=' + playerId));
    }
};

export default backend;