import sha256 from 'crypto-js/sha256.js';
import EncHex from 'crypto-js/enc-hex.js';

import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'node:fs';

import {PostMessage, EditMessage, PDFPage, PDFObject, Schedule} from './message-base.js';
import md5File from 'md5-file';

import type {Int} from "./int-type.js";

type HttpMethod = "POST" | "GET" | "DELETE" | "PUT";

interface ParamArgument {
	name: string;
	contents: string | number;
}

interface EditMessageReponse {
	message:string;
}
interface PostMessageReponse {
	message_id:Int;
}
interface MessagePagesResponse {
	id:Int;
	media:string;
	active:boolean;
	display_time?:Int;

}

interface GetMessageResponse {
	id: Int,
	name: string,
	email: string,
	title: string|null,
	message: string|null,
	conf?: object,
	date: Int,
	archived: boolean,
	media?:string,
	pages:Array<MessagePagesResponse>
}

interface ListMessagesReponse {
	total:Int;
	messages:Array<any>;
}
interface InformationResponse {
	name: string;
	category: string|null;
	type: "My Content" | "Wall";
	color: string|null;
	company: string|null;
	max_filesize: string;
}

function hash(msg: string) {
	return EncHex.stringify(sha256(msg));
}

class MyContentClient {

	/**
	 * Base URL for My Content API
	 *
	 * @var string
	 */
	private url: string = 'https://my-api.valota.live';

	/**
	 * Version of the API
	 *
	 * @var string
	 */
	private version: string = 'v1';

	/**
	 * API key from My Content App
	 * @var string
	 */
	private readonly apiKey: string;

	/**
	 * API secret from My Content App
	 * @var string
	 */
	private readonly apiSecret: string;

	/**
	 * These are added to fetch (node-fetch) request. e.g. {"x-additional-header":"value"}
	 */
	public fetchRequestHeaders: {[key:string]:string} = {};

	/**
	 * Additional options to be appended to all fetches (node-fetch). e.g.
	 */
	public fetchOptions: {[key:string]:any} = {};


	/**
	 * MyContentClient constructor.
	 *
	 * @param {string} apiKey    32 char long API key
	 * @param {string} apiSecret 64 char long API secret
	 *
	 * @throws \Exception If API key's or secret's length is invalid
	 */
	constructor(apiKey: string, apiSecret: string) {

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
	setUrl(url: string) {
		this.url = url;
	}

	/**
	 * Set API version
	 *
	 * @param {string} version
	 */
	setVersion(version: string) {
		this.version = version;
	}


	async doRequest(method: HttpMethod, endpoint: string, hash: string, params: ParamArgument[] = []): Promise<any> {

		const formData = new FormData();

		let hasData = false;
		params.forEach(el => {
			if(el.name ==='media') {
				formData.append(el.name, fs.createReadStream(el.contents as string));
				hasData = true;
			} else {
				formData.append(el.name, el.contents);
				hasData = true;
			}
		});
		//formData.append('file', fs.createReadStream('foo.txt'));
		//formData.append('blah', 42);


		return fetch(`${this.url}/${this.version}/${endpoint}`, {
			...this.fetchOptions,
			method: method,
			...(hasData ? {body:formData} : {} ),
			headers: {
				...this.fetchRequestHeaders,
				...(hasData ? formData.getHeaders() : {}),
				'x-api-key':this.apiKey,
				'x-api-hash':hash
			}
		}).then((res:any) => {

			if(res.ok) {
				return res.json();
			}

			throw res;
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
	async list(archive: boolean = false, page: Int = -1 as Int): Promise<ListMessagesReponse> {

		let endpoint = 'list';
		if (archive) {
			endpoint += '/archive/1';
		}
		if (page >= 0) {
			endpoint += '/page/' + page;
		}
		return this.doRequest('GET', endpoint, hash(this.apiSecret + this.apiKey));
	}

	/**
	 * Get a message
	 * @param messageId
	 */
	public get(messageId: number): Promise<GetMessageResponse> {

		return this.doRequest('GET', 'get/' + messageId, hash(this.apiSecret + messageId));

	}

	/**
	 * Archive a message
	 * @param messageId
	 */
	async archive(messageId: number): Promise<EditMessageReponse> {
		messageId = Math.round(messageId);
		return this.doRequest('POST', 'archive', hash(this.apiSecret + messageId), [{
			name: 'message_id',
			contents: messageId
		}]);
	}


	/**
	 * Restore a message from the archive
	 * @param messageId
	 */
	async restore(messageId: number): Promise<EditMessageReponse> {
		messageId = Math.round(messageId);
		return this.doRequest('POST', 'restore', hash(this.apiSecret + messageId), [{
			name: 'message_id',
			contents: messageId
		}]);
	}


	/**
	 * Permanently delete a message
	 *
	 * @param {int} messageId
	 */
	async delete(messageId: number): Promise<EditMessageReponse> {
		messageId = Math.round(messageId);
		return this.doRequest('DELETE', 'delete/' + messageId, hash(this.apiSecret + messageId));
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
	async post(postMessage: PostMessage): Promise<PostMessageReponse> {

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
			md5 = await md5File(media);
		}


		const hashStr = hash(this.apiSecret + md5 + title + msg);

		if(postMessage.scheduleIsSet) {
			post.push({name:'schedule', contents:JSON.stringify(postMessage.getSchedule())});
		}

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

		let newPages: PDFObject[] = [];
		if (postMessage.pages.length) {

			postMessage.pages.forEach((p: PDFPage) => {
				newPages.push(p.toObject());
			});

			post.push({
				name: 'pages',
				contents: JSON.stringify(newPages)
			});
		}

		return this.doRequest('POST', 'post', hashStr, post);
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
	async edit(editMessage: EditMessage): Promise<EditMessageReponse> {

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

		if(editMessage.scheduleIsSet) {
			post.push({name:'schedule', contents:JSON.stringify(editMessage.getSchedule())});
		}

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

		let newPages: PDFObject[] = [];
		if (editMessage.pages.length) {

			editMessage.pages.forEach((p: PDFPage) => {
				newPages.push(p.toObject());
			});

			post.push({
				name: 'pages',
				contents: JSON.stringify(newPages)
			});
		}

		return this.doRequest('POST', 'edit', hashStr, post);


	}

	/**
	 * Get basic information
	 */
	async information(): Promise<InformationResponse> {
		return this.doRequest('GET', 'information', hash(this.apiSecret + this.apiKey));
	}

}


export {MyContentClient, PostMessage,EditMessage,PDFPage};
