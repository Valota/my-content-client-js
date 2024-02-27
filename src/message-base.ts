import  striptags from "striptags";
import htmlSpecialChars from "./html-special-chars.js";

import fs from 'node:fs';

import mime from "mime";

import type {Int} from "./int-type.js";

/**
 * Format display time
 *
 * @param {int} displayTime
 */
function formatDisplayTime(displayTime: Int): Int {
	return Math.max(displayTime, 4) as Int;
}


interface Schedule {
	from?: Int;
	to?: Int;
}

interface PDFObject {
	/**
	 * Page number for new posts and page id for edited posts
	 */
	page_id?: Int;
	page?: Int;
	display_time?: Int;
	visible?: boolean;
}

class PDFPage {


	/**
	 *
	 * @var int Page number for new posts and page id for edited posts
	 */
	public pageId: Int;

	public displayTime: Int = -1 as Int;

	public visible: boolean = true;

	/**
	 * PDFPage constructor.
	 *
	 * @param int $pageId ID of the page when editing message or page number when creating a new one (pages starts at 1).
	 * @param int $displayTime Display time of the page. Set to 0 to unset
	 * @param bool $visible should this page be visible?
	 */
	constructor(pageId: Int, displayTime: Int = -1 as Int, visible: boolean = true) {
		this.pageId = pageId;

		if (displayTime === 0) {
			this.displayTime = 0 as Int;
		} else {
			this.displayTime = formatDisplayTime(displayTime);
		}
		this.visible = visible;

	}

	toObject(edit: boolean = false): PDFObject {
		const ret: PDFObject = {};
		if (edit) {
			ret.page_id = this.pageId;
		} else {
			ret.page = this.pageId;
		}

		if (this.displayTime !== -1) {
			ret.display_time = this.displayTime;
		}
		ret.visible = this.visible;

		return ret;
	}
}

abstract class MessageBase {

	protected ALLOWED_TAGS: string = "<b><strong><div><i><u><strike><s><del><ul><ol><li><br><em><code>";

	protected edit: boolean = false;

	private title: string = '';

	private message: string = '';

	/**
	 *
	 * @type {Int}
	 * @private
	 * @deprecated since version 1.1.0
	 */
	private durationFrom: Int = -1 as Int;

	/**
	 *
	 * @type {Int}
	 * @private
	 * @deprecated since version 1.1.0
	 */
	private durationTo: Int = -1 as Int;

	private displayTime: Int = -1 as Int;

	public schedule: Schedule[] = [];

	public scheduleIsSet:boolean = false;

	public pages: PDFPage[] = [];

	public titleEdited: boolean = false;

	public messageEdited: boolean = false;

	/**
	 * @return string
	 */
	getTitle(): string {
		return this.title;
	}

	/**
	 * Sets the title
	 *
	 * @param {string} title
	 *
	 */
	setTitle(title: string): this {
		this.titleEdited = true;
		title = htmlSpecialChars(title.trim()).substr(0, 512);

		this.title = title;

		return this;
	}


	getMessage(): string {
		return this.message;
	}

	/**
	 * Sets the message
	 *
	 * @param {string} message
	 *
	 */
	setMessage(message: string): this {
		this.messageEdited = true;
		if (!message) {
			this.message = "";
		} else {
			const isEmpty = !striptags(message).trim();
			if (isEmpty) {
				this.message = "";
			} else {
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
	getSchedule(): Schedule[] {
		return this.schedule;
	}

	/**
	 * Set schedule
	 *
	 * @param {Schedule[]} schedule
	 * @returns {this}
	 */
	setSchedule(schedule: Schedule[]): this {
		this.schedule=schedule;
		this.scheduleIsSet =true;
		return this;
	}

	/**
	 *
	 * @returns {number}
	 * @deprecated since version 1.1.0
	 */
	getDurationFrom(): number {
		return this.durationFrom;
	}

	/**
	 * @param {int} durationFrom unix epoch, use 0 to unset
	 * @deprecated since version 1.1.0
	 */
	setDurationFrom(durationFrom: Int): this {
		if (durationFrom >= 0) {
			this.durationFrom = durationFrom;
		}

		return this;
	}

	/**
	 * Return duration To
	 * @deprecated since version 1.1.0
	 */
	getDurationTo(): number {
		return this.durationTo;
	}

	/**
	 * @param {int} durationTo unix epoch, use 0 to unset
	 * @deprecated since version 1.1.0
	 */
	setDurationTo(durationTo: Int): this {

		if (durationTo >= 0) {
			this.durationTo = durationTo;
		}

		return this;
	}

	/**
	 * Checks that the message is valid
	 *
	 */
	abstract validate(): boolean;


	getDisplayTime() {
		return this.displayTime;
	}

	/**
	 * @param {int} displayTime use 0 to unset
	 */
	setDisplayTime(displayTime: Int): this {
		if (displayTime === 0) {
			this.displayTime = 0 as Int;
		} else {
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
	addPage(page: PDFPage): this {
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
	removePage(pageId: Int): this {

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

	private media: string = '';

	validate(): boolean {
		return !!(this.getTitle() || this.getMessage() || this.getMedia());
	}

	/**
	 * get media file path
	 */
	getMedia(): string {
		return this.media;
	}


	/**
	 * Set media for the post
	 * @param {string} absFilepath abs filepath to media /path/to/image.jpg
	 */
	setMedia(absFilepath: string): this {
		const media = absFilepath.trim();

		if (!media) {
			this.media = '';
		} else {
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

	public messageId: Int;


	constructor(messageId: Int) {
		super();
		this.edit = true;
		this.messageId = messageId;
	}

	validate(): boolean {
		return true;
	}


}


export {PostMessage, EditMessage, PDFPage, PDFObject, Schedule};
