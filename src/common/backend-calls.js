const backendURL = "https://localhost:3000";
const resourceBackendURL = 'https://localhost/resources/';

function endpoint_url(name, ...queryStrings) {
    let queryString = queryStrings.length ? "?" : '';

    for(const query of queryStrings) {
        queryString += '&' + query;
    }

    return '/' + name + queryString;
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
        return backendCall(endpoint_url('get_starting_avatars'));
    },

    createNewPlayer(name, playerId, avatar) {
        return backendCall(endpoint_url('create_new_player', 'platform=twitch'), 'PUT', {name: name, playerId: playerId, avatar: avatar});
    },

    getPlayer(playerId) {
        return backendCall(endpoint_url('get_player', 'platform=twitch', `playerId=${playerId}`));
    },

    joinGame(playerId, gameId) {
        return backendCall(endpoint_url('join_game', `playerId=${playerId}`, `gameId=${gameId}`), 'POST');
    },

    startBattle(playerId, gameId, monsterId) {
        return backendCall(endpoint_url('start_battle', `playerId=${playerId}`, `gameId=${gameId}`, `monsterId=${monsterId}`), 'POST');
    },

    battleAction(battleId, actionType) {
        return backendCall(endpoint_url('battle_action', `battleId=${battleId}`, `actionType=${actionType}`), 'POST');
    }

};

export default backend;