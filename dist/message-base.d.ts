import type { Int } from "./int-type";
interface PDFObject {
    /**
     * Page number for new posts and page id for edited posts
     */
    page_id?: Int;
    page?: Int;
    display_time?: Int;
    visible?: boolean;
}
declare class PDFPage {
    /**
     *
     * @var int Page number for new posts and page id for edited posts
     */
    pageId: Int;
    displayTime: Int;
    visible: boolean;
    /**
     * PDFPage constructor.
     *
     * @param int $pageId ID of the page when editing message or page number when creating a new one (pages starts at 1).
     * @param int $displayTime Display time of the page. Set to 0 to unset
     * @param bool $visible should this page be visible?
     */
    constructor(pageId: Int, displayTime?: Int, visible?: boolean);
    toObject(edit?: boolean): PDFObject;
}
declare abstract class MessageBase {
    protected ALLOWED_TAGS: string;
    protected edit: boolean;
    private title;
    private message;
    private durationFrom;
    private durationTo;
    private displayTime;
    pages: PDFPage[];
    titleEdited: boolean;
    messageEdited: boolean;
    /**
     * @return string
     */
    getTitle(): string;
    /**
     * Sets the title
     *
     * @param {string} title
     *
     */
    setTitle(title: string): this;
    getMessage(): string;
    /**
     * Sets the message
     *
     * @param {string} message
     *
     */
    setMessage(message: string): this;
    getDurationFrom(): number;
    /**
     * @param {int} durationFrom unix epoch, use 0 to unset
     */
    setDurationFrom(durationFrom: Int): this;
    /**
     * Return duration To
     */
    getDurationTo(): number;
    /**
     * @param {int} durationTo unix epoch, use 0 to unset
     *
     */
    setDurationTo(durationTo: Int): this;
    /**
     * Checks that the message is valid
     *
     */
    abstract validate(): boolean;
    getDisplayTime(): Int;
    /**
     * @param {int} displayTime use 0 to unset
     */
    setDisplayTime(displayTime: Int): this;
    /**
     * Add new page configuration
     *
     * @param \Valota\MyContentAPI\PDFPage page
     *
     * @return this
     */
    addPage(page: PDFPage): this;
    /**
     * Remove page configuration
     *
     * @param int pageId Page's ID
     *
     * @return this
     */
    removePage(pageId: Int): this;
}
declare class PostMessage extends MessageBase {
    private media;
    validate(): boolean;
    /**
     * get media file path
     */
    getMedia(): string;
    /**
     * Set media for the post
     * @param {string} absFilepath abs filepath to media /path/to/image.jpg
     */
    setMedia(absFilepath: string): this;
}
declare class EditMessage extends MessageBase {
    messageId: Int;
    constructor(messageId: Int);
    validate(): boolean;
}
export { PostMessage, EditMessage, PDFPage, PDFObject };
