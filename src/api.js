import config from "./config";

const SERVER_PATH = config.server.host;
const SERVER_PATH_BENTO = config.server.bento;
const SERVER_PATH_DOCKER = config.server.docker;
const FACT_API_PATH = config.fact_api_path;
const FACT_API_KEY = config.fact_api_key;

const get = (path = '') => {
    const options = {
        method: 'GET',
        // headers: { 'Content-Type': 'application/json', 'Pragma': 'no-cache', 'Cache-Control': 'private, no-cache, no-store, must-revalidate', 'Expires': '-1' },
        // credentials: 'include',
        // errorRedirect: false,
    };

    return fetch(SERVER_PATH + path, options);
}

const relevantClaimSearch = (path = '') => {
    const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        errorRedirect: false,
    };

    return fetch(`${FACT_API_PATH}?${path}&${new URLSearchParams({ key: FACT_API_KEY })}`, options);
}
const post = (server_path = SERVER_PATH, path = '', body = {}) => {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },//'Pragma': 'no-cache', 'Cache-Control': 'private, no-cache, no-store, must-revalidate', 'Expires': '-1' },
        body: JSON.stringify(body),
        // credentials: 'include',
    };

    return fetch(server_path + path, options)
}


const postFlask = (body = {}) => {
    return post(SERVER_PATH_DOCKER, '', body)
}

const postBento = (body = {}) => {
    return post(SERVER_PATH_BENTO, '', body)
}

const put = (path = '', body = {}) => {
    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Pragma': 'no-cache', 'Cache-Control': 'private, no-cache, no-store, must-revalidate', 'Expires': '-1' },
        body: JSON.stringify(body),
        credentials: 'include'
    };

    return fetch(SERVER_PATH + path, options);
}

export {
    get,
    postFlask,
    postBento,
    put,
    relevantClaimSearch
}