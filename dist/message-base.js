import striptags from "striptags";
import htmlSpecialChars from "./html-special-chars.js";
import fs from 'node:fs';
import mime from "mime";
/**
 * Format display time
 *
 * @param {int} displayTime
 */
function formatDisplayTime(displayTime) {
    return Math.max(displayTime, 4);
}
class PDFPage {
    /**
     * PDFPage constructor.
     *
     * @param int $pageId ID of the page when editing message or page number when creating a new one (pages starts at 1).
     * @param int $displayTime Display time of the page. Set to 0 to unset
     * @param bool $visible should this page be visible?
     */
    constructor(pageId, displayTime = -1, visible = true) {
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
    toObject(edit = false) {
        const ret = {};
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
    }
}
class MessageBase {
    constructor() {
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
    getTitle() {
        return this.title;
    }
    /**
     * Sets the title
     *
     * @param {string} title
     *
     */
    setTitle(title) {
        this.titleEdited = true;
        title = htmlSpecialChars(title.trim()).substr(0, 512);
        this.title = title;
        return this;
    }
    getMessage() {
        return this.message;
    }
    /**
     * Sets the message
     *
     * @param {string} message
     *
     */
    setMessage(message) {
        this.messageEdited = true;
        if (!message) {
            this.message = "";
        }
        else {
            const isEmpty = !striptags(message).trim();
            if (isEmpty) {
                this.message = "";
            }
            else {
                this.message = striptags(message.trim(), this.ALLOWED_TAGS).replace(new RegExp(/<([a-z][a-z0-9]*)[^>]*?(\/?)>/, 'ig'), "<$1$2>");
            }
        }
        return this;
    }
    /**
     * Get current schedule
     *
     * @returns {Schedule[]}
     */
    getSchedule() {
        return this.schedule;
    }
    /**
     * Set schedule
     *
     * @param {Schedule[]} schedule
     * @returns {this}
     */
    setSchedule(schedule) {
        this.schedule = schedule;
        this.scheduleIsSet = true;
        return this;
    }
    /**
     *
     * @returns {number}
     * @deprecated since version 1.1.0
     */
    getDurationFrom() {
        return this.durationFrom;
    }
    /**
     * @param {int} durationFrom unix epoch, use 0 to unset
     * @deprecated since version 1.1.0
     */
    setDurationFrom(durationFrom) {
        if (durationFrom >= 0) {
            this.durationFrom = durationFrom;
        }
        return this;
    }
    /**
     * Return duration To
     * @deprecated since version 1.1.0
     */
    getDurationTo() {
        return this.durationTo;
    }
    /**
     * @param {int} durationTo unix epoch, use 0 to unset
     * @deprecated since version 1.1.0
     */
    setDurationTo(durationTo) {
        if (durationTo >= 0) {
            this.durationTo = durationTo;
        }
        return this;
    }
    getDisplayTime() {
        return this.displayTime;
    }
    /**
     * @param {int} displayTime use 0 to unset
     */
    setDisplayTime(displayTime) {
        if (displayTime === 0) {
            this.displayTime = 0;
        }
        else {
            this.displayTime = formatDisplayTime(displayTime);
        }
        return this;
    }
    /**
     * Add new page configuration
     *
     * @param \Valota\MyContentAPI\PDFPage page
     *
     * @return this
     */
    addPage(page) {
        this.pages.push(page);
        return this;
    }
    /**
     * Remove page configuration
     *
     * @param int pageId Page's ID
     *
     * @return this
     */
    removePage(pageId) {
        for (let i = 0; i < this.pages.length; ++i) {
            if (this.pages[i].pageId === pageId) {
                this.pages.splice(i, 1);
                break;
            }
        }
        return this;
    }
}
class PostMessage extends MessageBase {
    constructor() {
        super(...arguments);
        this.media = '';
    }
    validate() {
        return !!(this.getTitle() || this.getMessage() || this.getMedia());
    }
    /**
     * get media file path
     */
    getMedia() {
        return this.media;
    }
    /**
     * Set media for the post
     * @param {string} absFilepath abs filepath to media /path/to/image.jpg
     */
    setMedia(absFilepath) {
        const media = absFilepath.trim();
        if (!media) {
            this.media = '';
        }
        else {
            if (!fs.existsSync(media)) {
                throw `File not found: ${media}`;
            }
            let mimeType = mime.getType(media);
            if (mimeType === null) {
                throw `Invalid mimetype for the media file, we accept image/*, video/* and application/pdf`;
            }
            if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/') && mimeType !== "application/pdf") {
                throw `Invalid mimetype for the media file, we accept image/*, video/* and application/pdf: ${mime}`;
            }
            this.media = media;
        }
        return this;
    }
}
class EditMessage extends MessageBase {
    constructor(messageId) {
        super();
        this.edit = true;
        this.messageId = messageId;
    }
    validate() {
        return true;
    }
}
export { PostMessage, EditMessage, PDFPage };
