/*
 * thw-inventory - An inventory query and assessment tool
 * Copyright © 2019 Marco Ziech (marco@ziech.net)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
export class ApiError extends Error {
    constructor({ json, res }) {
        super(`API request failed with response status ${res.status}`);
        this.json = json;
        this.res = res;
    }
}

function extractError(result) {
    if (!result.res.ok) {
        throw new ApiError(result);
    }
    return result;
}

function getMeta(metaName) {
    const metas = document.getElementsByTagName('meta');

    for (let i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute('name') === metaName) {
            return metas[i].getAttribute('content');
        }
    }

    return '';
}

function extractResponse(res) {
    if (res.headers.has("Content-type") && res.headers.get("Content-type").indexOf("application/json") === 0) {
        return res.json().then(json => {
            return extractError({ json, res });
        });
    }
    return extractError({ res });
}

export default new class Api {
    constructor() {
        this.contextPath = getMeta("x-context-path");
        this.basePath = `${this.contextPath}/api`;
        this.headers = {};
    }

    get(path) {
        return window.fetch(`${this.basePath}${path}`, {
            method: 'get'
        }).then(res => extractResponse(res));
    }

    post(path, body) {
        return window.fetch(`${this.basePath}${path}`, {
            method: 'post',
            headers: Object.assign({
                'Content-Type': 'application/json;charset=UTF-8'
            }, this.headers),
            body: JSON.stringify(body)
        }).then(res => extractResponse(res));
    }

    postFile(path, file) {
        return window.fetch(`${this.basePath}${path}`, {
            method: 'post',
            headers: Object.assign({
                'Content-Type': 'application/octet-stream'
            }, this.headers),
            body: file
        }).then(res => extractResponse(res));
    }

}
