"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFPage = exports.EditMessage = exports.PostMessage = exports.MyContentClient = void 0;
var sha256 = require("crypto-js/sha256");
var EncHex = require("crypto-js/enc-hex");
var FormData = require("form-data");
var node_fetch_1 = require("node-fetch");
var fs = require("fs");
var message_base_1 = require("./message-base");
Object.defineProperty(exports, "PostMessage", { enumerable: true, get: function () { return message_base_1.PostMessage; } });
Object.defineProperty(exports, "EditMessage", { enumerable: true, get: function () { return message_base_1.EditMessage; } });
Object.defineProperty(exports, "PDFPage", { enumerable: true, get: function () { return message_base_1.PDFPage; } });
var md5File = require("md5-file");
function hash(msg) {
    return EncHex.stringify(sha256(msg));
}
var MyContentClient = /** @class */ (function () {
    /**
     * MyContentClient constructor.
     *
     * @param {string} apiKey    32 char long API key
     * @param {string} apiSecret 64 char long API secret
     *
     * @throws \Exception If API key's or secret's length is invalid
     */
    function MyContentClient(apiKey, apiSecret) {
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
        /**
         * These are added to fetch (node-fetch) request. e.g. {"x-additional-header":"value"}
         */
        this.fetchRequestHeaders = {};
        /**
         * Additional options to be appended to all fetches (node-fetch). e.g.
         */
        this.fetchOptions = {};
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
    MyContentClient.prototype.setUrl = function (url) {
        this.url = url;
    };
    /**
     * Set API version
     *
     * @param {string} version
     */
    MyContentClient.prototype.setVersion = function (version) {
        this.version = version;
    };
    MyContentClient.prototype.doRequest = function (method, endpoint, hash, params) {
        if (params === void 0) { params = []; }
        return __awaiter(this, void 0, void 0, function () {
            var formData, hasData;
            return __generator(this, function (_a) {
                formData = new FormData();
                hasData = false;
                params.forEach(function (el) {
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
                return [2 /*return*/, (0, node_fetch_1.default)("".concat(this.url, "/").concat(this.version, "/").concat(endpoint), __assign(__assign(__assign(__assign({}, this.fetchOptions), { method: method }), (hasData ? { body: formData } : {})), { headers: __assign(__assign(__assign({}, this.fetchRequestHeaders), (hasData ? formData.getHeaders() : {})), { 'x-api-key': this.apiKey, 'x-api-hash': hash }) })).then(function (res) {
                        if (res.ok) {
                            return res.json();
                        }
                        throw res;
                    })];
            });
        });
    };
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
    MyContentClient.prototype.list = function (archive, page) {
        if (archive === void 0) { archive = false; }
        if (page === void 0) { page = -1; }
        return __awaiter(this, void 0, void 0, function () {
            var endpoint;
            return __generator(this, function (_a) {
                endpoint = 'list';
                if (archive) {
                    endpoint += '/archive/1';
                }
                if (page >= 0) {
                    endpoint += '/page/' + page;
                }
                return [2 /*return*/, this.doRequest('GET', endpoint, hash(this.apiSecret + this.apiKey))];
            });
        });
    };
    /**
     * Get a message
     * @param messageId
     */
    MyContentClient.prototype.get = function (messageId) {
        return this.doRequest('GET', 'get/' + messageId, hash(this.apiSecret + messageId));
    };
    /**
     * Archive a message
     * @param messageId
     */
    MyContentClient.prototype.archive = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                messageId = Math.round(messageId);
                return [2 /*return*/, this.doRequest('POST', 'archive', hash(this.apiSecret + messageId), [{
                            name: 'message_id',
                            contents: messageId
                        }])];
            });
        });
    };
    /**
     * Restore a message from the archive
     * @param messageId
     */
    MyContentClient.prototype.restore = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                messageId = Math.round(messageId);
                return [2 /*return*/, this.doRequest('POST', 'restore', hash(this.apiSecret + messageId), [{
                            name: 'message_id',
                            contents: messageId
                        }])];
            });
        });
    };
    /**
     * Permanently delete a message
     *
     * @param {int} messageId
     */
    MyContentClient.prototype.delete = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                messageId = Math.round(messageId);
                return [2 /*return*/, this.doRequest('DELETE', 'delete/' + messageId, hash(this.apiSecret + messageId))];
            });
        });
    };
    /**
     * Posts a message
     *
     * @param {PostMessage} postMessage
     *
     * @return int message id of the created message
     *
     * @throws \Exception if message is invalid
     */
    MyContentClient.prototype.post = function (postMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var post, title, msg, media, md5, hashStr, durationFrom, durationTo, displayTime, newPages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!postMessage.validate()) {
                            throw "Invalid message. Please check that is has at least title, message or media.";
                        }
                        post = [];
                        title = postMessage.getTitle();
                        if (title) {
                            post.push({
                                name: 'title',
                                contents: title
                            });
                        }
                        msg = postMessage.getMessage();
                        if (msg) {
                            post.push({
                                name: 'message',
                                contents: msg
                            });
                        }
                        media = postMessage.getMedia();
                        md5 = '';
                        if (!media) return [3 /*break*/, 2];
                        post.push({
                            name: 'media',
                            contents: media
                        });
                        return [4 /*yield*/, md5File(media)];
                    case 1:
                        md5 = _a.sent();
                        _a.label = 2;
                    case 2:
                        hashStr = hash(this.apiSecret + md5 + title + msg);
                        if (postMessage.scheduleIsSet) {
                            post.push({ name: 'schedule', contents: JSON.stringify(postMessage.getSchedule()) });
                        }
                        durationFrom = postMessage.getDurationFrom();
                        if (durationFrom > 0) {
                            post.push({
                                name: 'duration_from',
                                contents: durationFrom
                            });
                        }
                        durationTo = postMessage.getDurationTo();
                        if (durationTo > 0) {
                            post.push({
                                name: 'duration_to',
                                contents: durationTo
                            });
                        }
                        displayTime = postMessage.getDisplayTime();
                        if (displayTime > 0) {
                            post.push({
                                name: 'display_time',
                                contents: displayTime
                            });
                        }
                        newPages = [];
                        if (postMessage.pages.length) {
                            postMessage.pages.forEach(function (p) {
                                newPages.push(p.toObject());
                            });
                            post.push({
                                name: 'pages',
                                contents: JSON.stringify(newPages)
                            });
                        }
                        return [2 /*return*/, this.doRequest('POST', 'post', hashStr, post)];
                }
            });
        });
    };
    /**
     * Edit a message
     *
     * @param {EditMessage} editMessage
     *
     * @return array assoc array with message
     *
     * @throws \Exception if message is invalid
     */
    MyContentClient.prototype.edit = function (editMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var post, hashStr, durationFrom, durationTo, displayTime, newPages;
            return __generator(this, function (_a) {
                if (!editMessage.validate()) {
                    throw "Invalid message. Refuse to send.";
                }
                post = [];
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
                hashStr = hash(this.apiSecret + editMessage.messageId);
                if (editMessage.scheduleIsSet) {
                    post.push({ name: 'schedule', contents: JSON.stringify(editMessage.getSchedule()) });
                }
                durationFrom = editMessage.getDurationFrom();
                if (durationFrom >= 0) {
                    post.push({
                        name: 'duration_from',
                        contents: durationFrom
                    });
                }
                durationTo = editMessage.getDurationTo();
                if (durationTo >= 0) {
                    post.push({
                        name: 'duration_to',
                        contents: durationTo
                    });
                }
                displayTime = editMessage.getDisplayTime();
                if (displayTime >= 0) {
                    post.push({
                        name: 'display_time',
                        contents: displayTime
                    });
                }
                newPages = [];
                if (editMessage.pages.length) {
                    editMessage.pages.forEach(function (p) {
                        newPages.push(p.toObject());
                    });
                    post.push({
                        name: 'pages',
                        contents: JSON.stringify(newPages)
                    });
                }
                return [2 /*return*/, this.doRequest('POST', 'edit', hashStr, post)];
            });
        });
    };
    /**
     * Get basic information
     */
    MyContentClient.prototype.information = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.doRequest('GET', 'information', hash(this.apiSecret + this.apiKey))];
            });
        });
    };
    return MyContentClient;
}());
exports.MyContentClient = MyContentClient;
