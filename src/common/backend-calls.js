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
    const response = await fetch(encodeURI(backendURL + endpoint), fetchOptions);
    const data = await response.json();

    if(response.status != 200) {
        throw data;
    }

    return data;
}

function getResourceURL(name) {
    return resourceBackendURL + name;
}

function getStartingAvatars() {
    return backendCall(endpoint_url('get_starting_avatars'));
}

function createNewPlayer(name, playerId, avatar) {
    return backendCall(endpoint_url('create_new_player', 'platform=twitch'), 'PUT', {name: name, playerId: playerId, avatar: avatar});
}

function getPlayer(playerId, platform) {
    if (platform) {
        return backendCall(endpoint_url('get_player', 'platform=twitch', `playerId=${playerId}`));
    }
    return backendCall(endpoint_url('get_player', `playerId=${playerId}`));
}

function joinGame(playerId, gameId) {
    return backendCall(endpoint_url('join_game', `playerId=${playerId}`, `gameId=${gameId}`), 'POST');
}

function getGame(gameId) {
    return backendCall(endpoint_url('get_game', `gameId=${gameId}`));
}

function startBattle(playerId, gameId, monsterId) {
    return backendCall(endpoint_url('start_battle', `playerId=${playerId}`, `gameId=${gameId}`, `monsterId=${monsterId}`), 'POST');
}

function battleAction(battleId, actionType) {
    return backendCall(endpoint_url('battle_action', `battleId=${battleId}`, `actionType=${actionType}`), 'POST');
}

function equipWeapon(playerId, weaponId) {
    return backendCall(endpoint_url('equip_weapon', `playerId=${playerId}`, `weaponId=${weaponId}`), 'POST');
}

function dropWeapon(playerId, weaponId) {
    return backendCall(endpoint_url('drop_weapon', `playerId=${playerId}`, `weaponId=${weaponId}`), 'POST');
}

function equipAbility(playerId, abilityBookName, abilityIndex, replacedAbilityName) {
    if(replacedAbilityName) {
        return backendCall(endpoint_url('equip_ability', `playerId=${playerId}`, `abilityBookName=${abilityBookName}`, `abilityIndex=${abilityIndex}`, `replacedAbilityName=${replacedAbilityName}`), 'POST');    
    }
    return backendCall(endpoint_url('equip_ability', `playerId=${playerId}`, `abilityBookName=${abilityBookName}`, `abilityIndex=${abilityIndex}`), 'POST');
}

const backend = {
    getResourceURL,
    getStartingAvatars,
    createNewPlayer,
    getPlayer,
    joinGame,
    getGame,
    startBattle,
    battleAction,
    equipWeapon,
    dropWeapon,
    equipAbility
};

export default backend;