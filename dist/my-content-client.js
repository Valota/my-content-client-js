"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFPage = exports.EditMessage = exports.PostMessage = exports.MyContentClient = void 0;
const sha256 = require("crypto-js/sha256");
const EncHex = require("crypto-js/enc-hex");
const FormData = require("form-data");
const node_fetch_1 = require("node-fetch");
const fs = require("fs");
const message_base_1 = require("./message-base");
Object.defineProperty(exports, "PostMessage", { enumerable: true, get: function () { return message_base_1.PostMessage; } });
Object.defineProperty(exports, "EditMessage", { enumerable: true, get: function () { return message_base_1.EditMessage; } });
Object.defineProperty(exports, "PDFPage", { enumerable: true, get: function () { return message_base_1.PDFPage; } });
const md5File = require("md5-file");
function hash(msg) {
    return EncHex.stringify(sha256(msg));
}
class MyContentClient {
    /**
     * MyContentClient constructor.
     *
     * @param {string} apiKey    32 char long API key
     * @param {string} apiSecret 64 char long API secret
     *
     * @throws \Exception If API key's or secret's length is invalid
     */
    constructor(apiKey, apiSecret) {
        /**
         * Base URL for My Content API
         *
         * @var string
         */
        this.url = 'https://my-api.valota.live';
        /**
         * Version of the API
         *
         * @var string
         */
        this.version = 'v1';
        if (apiKey.length !== 32) {
            throw "API key should be exactly 32 characters long.";
        }
        if (apiSecret.length !== 64) {
            throw "API secret should be exactly 64 characters long.";
        }
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    /**
     * Set base URL
     *
     * @param {string} url
     */
    setUrl(url) {
        this.url = url;
    }
    /**
     * Set API version
     *
     * @param {string} version
     */
    setVersion(version) {
        this.version = version;
    }
    doRequest(method, endpoint, hash, params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const formData = new FormData();
            let hasData = false;
            params.forEach(el => {
                if (el.name === 'media') {
                    formData.append(el.name, fs.createReadStream(el.contents));
                    hasData = true;
                }
                else {
                    formData.append(el.name, el.contents);
                    hasData = true;
                }
            });
            //formData.append('file', fs.createReadStream('foo.txt'));
            //formData.append('blah', 42);
            return node_fetch_1.default(`${this.url}/${this.version}/${endpoint}`, Object.assign(Object.assign({ method: method }, (hasData ? { body: formData } : {})), { headers: Object.assign(Object.assign({}, (hasData ? formData.getHeaders() : {})), { 'x-api-key': this.apiKey, 'x-api-hash': hash }) })).then((res) => {
                if (res.ok) {
                    return res.json();
                }
                throw res;
            });
        });
    }
    /**
     * List messages
     *
     * @param {boolean} archive List archive
     * @param {int|null} page page number
     *
     * @return array
     *
     * @throws
     */
    list(archive = false, page = -1) {
        return __awaiter(this, void 0, void 0, function* () {
            let endpoint = 'list';
            if (archive) {
                endpoint += '/archive/1';
            }
            if (page >= 0) {
                endpoint += '/page/' + page;
            }
            return this.doRequest('GET', endpoint, hash(this.apiSecret + this.apiKey));
        });
    }
    /**
     * Get a message
     * @param messageId
     */
    get(messageId) {
        return this.doRequest('GET', 'get/' + messageId, hash(this.apiSecret + messageId));
    }
    /**
     * Archive a message
     * @param messageId
     */
    archive(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            messageId = Math.round(messageId);
            return this.doRequest('POST', 'archive', hash(this.apiSecret + messageId), [{
                    name: 'message_id',
                    contents: messageId
                }]);
        });
    }
    /**
     * Restore a message from the archive
     * @param messageId
     */
    restore(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            messageId = Math.round(messageId);
            return this.doRequest('POST', 'restore', hash(this.apiSecret + messageId), [{
                    name: 'message_id',
                    contents: messageId
                }]);
        });
    }
    /**
     * Permanently delete a message
     *
     * @param {int} messageId
     */
    delete(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            messageId = Math.round(messageId);
            return this.doRequest('DELETE', 'delete/' + messageId, hash(this.apiSecret + messageId));
        });
    }
    /**
     * Posts a message
     *
     * @param {PostMessage} postMessage
     *
     * @return int message id of the created message
     *
     * @throws \Exception if message is invalid
     */
    post(postMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!postMessage.validate()) {
                throw `Invalid message. Please check that is has at least title, message or media.`;
            }
            const post = [];
            const title = postMessage.getTitle();
            if (title) {
                post.push({
                    name: 'title',
                    contents: title
                });
            }
            const msg = postMessage.getMessage();
            if (msg) {
                post.push({
                    name: 'message',
                    contents: msg
                });
            }
            const media = postMessage.getMedia();
            let md5 = '';
            if (media) {
                post.push({
                    name: 'media',
                    contents: media
                });
                md5 = yield md5File(media);
            }
            const hashStr = hash(this.apiSecret + md5 + title + msg);
            const durationFrom = postMessage.getDurationFrom();
            if (durationFrom > 0) {
                post.push({
                    name: 'duration_from',
                    contents: durationFrom
                });
            }
            const durationTo = postMessage.getDurationTo();
            if (durationTo > 0) {
                post.push({
                    name: 'duration_to',
                    contents: durationTo
                });
            }
            const displayTime = postMessage.getDisplayTime();
            if (displayTime > 0) {
                post.push({
                    name: 'display_time',
                    contents: displayTime
                });
            }
            let newPages = [];
            if (postMessage.pages.length) {
                postMessage.pages.forEach((p) => {
                    newPages.push(p.toObject());
                });
                post.push({
                    name: 'pages',
                    contents: JSON.stringify(newPages)
                });
            }
            return this.doRequest('POST', 'post', hashStr, post);
        });
    }
    /**
     * Edit a message
     *
     * @param {EditMessage} editMessage
     *
     * @return array assoc array with message
     *
     * @throws \Exception if message is invalid
     */
    edit(editMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!editMessage.validate()) {
                throw `Invalid message. Refuse to send.`;
            }
            const post = [];
            post.push({
                name: 'message_id',
                contents: editMessage.messageId
            });
            if (editMessage.titleEdited) {
                post.push({
                    name: 'title',
                    contents: editMessage.getTitle()
                });
            }
            if (editMessage.messageEdited) {
                post.push({
                    name: 'message',
                    contents: editMessage.getMessage()
                });
            }
            const hashStr = hash(this.apiSecret + editMessage.messageId);
            const durationFrom = editMessage.getDurationFrom();
            if (durationFrom >= 0) {
                post.push({
                    name: 'duration_from',
                    contents: durationFrom
                });
            }
            const durationTo = editMessage.getDurationTo();
            if (durationTo >= 0) {
                post.push({
                    name: 'duration_to',
                    contents: durationTo
                });
            }
            const displayTime = editMessage.getDisplayTime();
            if (displayTime >= 0) {
                post.push({
                    name: 'display_time',
                    contents: displayTime
                });
            }
            let newPages = [];
            if (editMessage.pages.length) {
                editMessage.pages.forEach((p) => {
                    newPages.push(p.toObject());
                });
                post.push({
                    name: 'pages',
                    contents: JSON.stringify(newPages)
                });
            }
            return this.doRequest('POST', 'edit', hashStr, post);
        });
    }
    /**
     * Get basic information
     */
    information() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doRequest('GET', 'information', hash(this.apiSecret + this.apiKey));
        });
    }
}
exports.MyContentClient = MyContentClient;
