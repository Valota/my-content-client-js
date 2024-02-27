"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFPage = exports.EditMessage = exports.PostMessage = void 0;
var striptags = require("striptags");
var html_special_chars_1 = require("./html-special-chars");
var fs = require("fs");
var mime_1 = require("mime");
/**
 * Format display time
 *
 * @param {int} displayTime
 */
function formatDisplayTime(displayTime) {
    return Math.max(displayTime, 4);
}
var PDFPage = /** @class */ (function () {
    /**
     * PDFPage constructor.
     *
     * @param int $pageId ID of the page when editing message or page number when creating a new one (pages starts at 1).
     * @param int $displayTime Display time of the page. Set to 0 to unset
     * @param bool $visible should this page be visible?
     */
    function PDFPage(pageId, displayTime, visible) {
        if (displayTime === void 0) { displayTime = -1; }
        if (visible === void 0) { visible = true; }
        this.displayTime = -1;
        this.visible = true;
        this.pageId = pageId;
        if (displayTime === 0) {
            this.displayTime = 0;
        }
        else {
            this.displayTime = formatDisplayTime(displayTime);
        }
        this.visible = visible;
    }
    PDFPage.prototype.toObject = function (edit) {
        if (edit === void 0) { edit = false; }
        var ret = {};
        if (edit) {
            ret.page_id = this.pageId;
        }
        else {
            ret.page = this.pageId;
        }
        if (this.displayTime !== -1) {
            ret.display_time = this.displayTime;
        }
        ret.visible = this.visible;
        return ret;
    };
    return PDFPage;
}());
exports.PDFPage = PDFPage;
var MessageBase = /** @class */ (function () {
    function MessageBase() {
        this.ALLOWED_TAGS = "<b><strong><div><i><u><strike><s><del><ul><ol><li><br><em><code>";
        this.edit = false;
        this.title = '';
        this.message = '';
        /**
         *
         * @type {Int}
         * @private
         * @deprecated since version 1.1.0
         */
        this.durationFrom = -1;
        /**
         *
         * @type {Int}
         * @private
         * @deprecated since version 1.1.0
         */
        this.durationTo = -1;
        this.displayTime = -1;
        this.schedule = [];
        this.scheduleIsSet = false;
        this.pages = [];
        this.titleEdited = false;
        this.messageEdited = false;
    }
    /**
     * @return string
     */
    MessageBase.prototype.getTitle = function () {
        return this.title;
    };
    /**
     * Sets the title
     *
     * @param {string} title
     *
     */
    MessageBase.prototype.setTitle = function (title) {
        this.titleEdited = true;
        title = (0, html_special_chars_1.default)(title.trim()).substr(0, 512);
        this.title = title;
        return this;
    };
    MessageBase.prototype.getMessage = function () {
        return this.message;
    };
    /**
     * Sets the message
     *
     * @param {string} message
     *
     */
    MessageBase.prototype.setMessage = function (message) {
        this.messageEdited = true;
        if (!message) {
            this.message = "";
        }
        else {
            var isEmpty = !striptags(message).trim();
            if (isEmpty) {
                this.message = "";
            }
            else {
                this.message = striptags(message.trim(), this.ALLOWED_TAGS).replace(new RegExp(/<([a-z][a-z0-9]*)[^>]*?(\/?)>/, 'ig'), "<$1$2>");
            }
        }
        return this;
    };
    /**
     * Get current schedule
     *
     * @returns {Schedule[]}
     */
    MessageBase.prototype.getSchedule = function () {
        return this.schedule;
    };
    /**
     * Set schedule
     *
     * @param {Schedule[]} schedule
     * @returns {this}
     */
    MessageBase.prototype.setSchedule = function (schedule) {
        this.schedule = schedule;
        this.scheduleIsSet = true;
        return this;
    };
    /**
     *
     * @returns {number}
     * @deprecated since version 1.1.0
     */
    MessageBase.prototype.getDurationFrom = function () {
        return this.durationFrom;
    };
    /**
     * @param {int} durationFrom unix epoch, use 0 to unset
     * @deprecated since version 1.1.0
     */
    MessageBase.prototype.setDurationFrom = function (durationFrom) {
        if (durationFrom >= 0) {
            this.durationFrom = durationFrom;
        }
        return this;
    };
    /**
     * Return duration To
     * @deprecated since version 1.1.0
     */
    MessageBase.prototype.getDurationTo = function () {
        return this.durationTo;
    };
    /**
     * @param {int} durationTo unix epoch, use 0 to unset
     * @deprecated since version 1.1.0
     */
    MessageBase.prototype.setDurationTo = function (durationTo) {
        if (durationTo >= 0) {
            this.durationTo = durationTo;
        }
        return this;
    };
    MessageBase.prototype.getDisplayTime = function () {
        return this.displayTime;
    };
    /**
     * @param {int} displayTime use 0 to unset
     */
    MessageBase.prototype.setDisplayTime = function (displayTime) {
        if (displayTime === 0) {
            this.displayTime = 0;
        }
        else {
            this.displayTime = formatDisplayTime(displayTime);
        }
        return this;
    };
    /**
     * Add new page configuration
     *
     * @param \Valota\MyContentAPI\PDFPage page
     *
     * @return this
     */
    MessageBase.prototype.addPage = function (page) {
        this.pages.push(page);
        return this;
    };
    /**
     * Remove page configuration
     *
     * @param int pageId Page's ID
     *
     * @return this
     */
    MessageBase.prototype.removePage = function (pageId) {
        for (var i = 0; i < this.pages.length; ++i) {
            if (this.pages[i].pageId === pageId) {
                this.pages.splice(i, 1);
                break;
            }
        }
        return this;
    };
    return MessageBase;
}());
var PostMessage = /** @class */ (function (_super) {
    __extends(PostMessage, _super);
    function PostMessage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.media = '';
        return _this;
    }
    PostMessage.prototype.validate = function () {
        return !!(this.getTitle() || this.getMessage() || this.getMedia());
    };
    /**
     * get media file path
     */
    PostMessage.prototype.getMedia = function () {
        return this.media;
    };
    /**
     * Set media for the post
     * @param {string} absFilepath abs filepath to media /path/to/image.jpg
     */
    PostMessage.prototype.setMedia = function (absFilepath) {
        var media = absFilepath.trim();
        if (!media) {
            this.media = '';
        }
        else {
            if (!fs.existsSync(media)) {
                throw "File not found: ".concat(media);
            }
            var mimeType = mime_1.default.getType(media);
            if (mimeType === null) {
                throw "Invalid mimetype for the media file, we accept image/*, video/* and application/pdf";
            }
            if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/') && mimeType !== "application/pdf") {
                throw "Invalid mimetype for the media file, we accept image/*, video/* and application/pdf: ".concat(mime_1.default);
            }
            this.media = media;
        }
        return this;
    };
    return PostMessage;
}(MessageBase));
exports.PostMessage = PostMessage;
var EditMessage = /** @class */ (function (_super) {
    __extends(EditMessage, _super);
    function EditMessage(messageId) {
        var _this = _super.call(this) || this;
        _this.edit = true;
        _this.messageId = messageId;
        return _this;
    }
    EditMessage.prototype.validate = function () {
        return true;
    };
    return EditMessage;
}(MessageBase));
exports.EditMessage = EditMessage;
