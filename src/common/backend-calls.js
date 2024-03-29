const backendURL = process.env.NODE_ENV === 'development' ? "http://localhost:3000" : 'https://web-rpg-9000.uw.r.appspot.com/';
const resourceBackendURL = process.env.NODE_ENV === 'development' ? 'https://localhost/resources/' : 'https://storage.googleapis.com/web_rpg_resources/';

function endpoint_url(name, ...queryStrings) {
    let queryString = queryStrings.length ? "?" : '';

    for(const query of queryStrings) {
        queryString += '&' + query;
    }

    return '/' + name + queryString;
}

async function backendCall(endpoint, method='GET', payload) {
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

function startBattle(playerId, gameId, monsterId, fallbackMonster) {
    return backendCall(endpoint_url('start_battle', `playerId=${playerId}`, `gameId=${gameId}`, `monsterId=${monsterId}`), 'POST', {fallbackMonster});
}

function battleAction(battleId, actionRequest) {
    const queryStrings = [`battleId=${battleId}`, `actionType=${actionRequest.actionType}`];
    
    if(actionRequest.hasOwnProperty('abilityName')) {
        queryStrings.push(`abilityName=${actionRequest.abilityName}`);
    }
    else if(actionRequest.hasOwnProperty('itemName')) {
        queryStrings.push(`itemName=${actionRequest.itemName}`);
    }

    return backendCall(endpoint_url('battle_action', ...queryStrings), 'POST');
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

function dropBook(playerId, abilityBookName) {
    return backendCall(endpoint_url('drop_book', `playerId=${playerId}`, `abilityBookName=${abilityBookName}`), 'POST');
}

function dropItem(playerId, itemName) {
    return backendCall(endpoint_url('drop_item', `playerId=${playerId}`, `itemName=${itemName}`), 'POST');
}

function getShop() {
    return backendCall(endpoint_url('get_shop', `shopId=daily`));
}

function buy(playerId, shopId, productId) {
    return backendCall(endpoint_url('buy', `playerId=${playerId}`, `shopId=${shopId}`, `productId=${productId}`), 'POST');
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
    equipAbility,
    dropBook,
    dropItem,
    getShop,
    buy
};

export default backend;