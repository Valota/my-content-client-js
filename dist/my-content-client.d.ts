import { PostMessage, EditMessage, PDFPage } from './message-base';
import type { Int } from "./int-type";
declare type HttpMethod = "POST" | "GET" | "DELETE" | "PUT";
interface ParamArgument {
    name: string;
    contents: string | number;
}
interface EditMessageReponse {
    message: string;
}
interface PostMessageReponse {
    message_id: Int;
}
interface MessagePagesResponse {
    id: Int;
    media: string;
    active: boolean;
    display_time?: Int;
}
interface GetMessageResponse {
    id: Int;
    name: string;
    email: string;
    title: string | null;
    message: string | null;
    conf?: object;
    date: Int;
    archived: boolean;
    media?: string;
    pages: Array<MessagePagesResponse>;
}
interface ListMessagesReponse {
    total: Int;
    messages: Array<any>;
}
interface InformationResponse {
    name: string;
    category: string | null;
    type: "My Content" | "Wall";
    color: string | null;
    company: string | null;
    max_filesize: string;
}
declare class MyContentClient {
    /**
     * Base URL for My Content API
     *
     * @var string
     */
    private url;
    /**
     * Version of the API
     *
     * @var string
     */
    private version;
    /**
     * API key from My Content App
     * @var string
     */
    private readonly apiKey;
    /**
     * API secret from My Content App
     * @var string
     */
    private readonly apiSecret;
    /**
     * MyContentClient constructor.
     *
     * @param {string} apiKey    32 char long API key
     * @param {string} apiSecret 64 char long API secret
     *
     * @throws \Exception If API key's or secret's length is invalid
     */
    constructor(apiKey: string, apiSecret: string);
    /**
     * Set base URL
     *
     * @param {string} url
     */
    setUrl(url: string): void;
    /**
     * Set API version
     *
     * @param {string} version
     */
    setVersion(version: string): void;
    doRequest(method: HttpMethod, endpoint: string, hash: string, params?: ParamArgument[]): Promise<any>;
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
    list(archive?: boolean, page?: Int): Promise<ListMessagesReponse>;
    /**
     * Get a message
     * @param messageId
     */
    get(messageId: number): Promise<GetMessageResponse>;
    /**
     * Archive a message
     * @param messageId
     */
    archive(messageId: number): Promise<EditMessageReponse>;
    /**
     * Restore a message from the archive
     * @param messageId
     */
    restore(messageId: number): Promise<EditMessageReponse>;
    /**
     * Permanently delete a message
     *
     * @param {int} messageId
     */
    delete(messageId: number): Promise<EditMessageReponse>;
    /**
     * Posts a message
     *
     * @param {PostMessage} postMessage
     *
     * @return int message id of the created message
     *
     * @throws \Exception if message is invalid
     */
    post(postMessage: PostMessage): Promise<PostMessageReponse>;
    /**
     * Edit a message
     *
     * @param {EditMessage} editMessage
     *
     * @return array assoc array with message
     *
     * @throws \Exception if message is invalid
     */
    edit(editMessage: EditMessage): Promise<EditMessageReponse>;
    /**
     * Get basic information
     */
    information(): Promise<InformationResponse>;
}
export { MyContentClient, PostMessage, EditMessage, PDFPage };
