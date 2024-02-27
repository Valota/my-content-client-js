import {MyContentClient, EditMessage, PostMessage} from '../dist/my-content-client.js';

import should from 'should';
import config from '../credentials.js';

import {LoremIpsum} from "lorem-ipsum";
import {HttpsProxyAgent} from "https-proxy-agent";

describe('API Tests 1', function () {
	const client = new MyContentClient(config._API_KEY, config._API_SECRET);

	if (config._API_URL) {
		client.setUrl(config._API_URL)
	}

	if (config._API_VERSION) {
		client.setVersion(config._API_VERSION)
	}


	it('API Endpoint - information', async function () {
		const resp = await client.information();

		resp.should.have.properties(["name",
			"category",
			"type",
			"color",
			"company",
			"max_filesize"]);
	});

	it('API Endpoint - list', async function () {
		try {
			const resp = await client.list();

			resp.should.have.property("total").which.is.a.Number();
			resp.should.have.property("messages").which.is.an.Array();
		} catch (err) {
			throw new Error(err.status + ' ' + err.statusText);
		}

	});

	it('API Endpoint - post', async function () {

		const lorem = new LoremIpsum();


		const title = lorem.generateSentences(1);
		const message = lorem.generateSentences(5);
		const post = new PostMessage();
		post.setTitle(title);
		post.setMessage(message);
		if (config._TEST_MEDIA_PATH) {
			post.setMedia(config._TEST_MEDIA_PATH);
		}
		const postResponse = await client.post(post);
		postResponse.should.have.property("message_id").which.is.a.Number();
		const mid = postResponse.message_id;
		describe('API Tests 2', function () {
			it('API Endpoint - get', async function () {
				const resp = await client.get(mid);
				resp.should.have.properties({id: mid, title: title, message: message});

				describe('API Tests 3', function () {
					it('API Endpoint - edit', async function () {
						const editTitle = lorem.generateSentences(1);
						const editMessage = lorem.generateSentences(5);
						const edit = new EditMessage(mid);
						edit.setTitle(editTitle);
						edit.setMessage(editMessage);
						const resp = await client.edit(edit);
						resp.should.have.property('message', 'Message was updated.');
						describe('API Tests 4', function () {
							it('API Endpoint - get after edit', async function () {
								const resp = await client.get(mid);
								resp.should.have.properties({id: mid, title: editTitle, message: editMessage});


								describe('API Tests 5', function () {
									it('API Endpoint - archive, restore and delete', async function () {
										const resp = await client.archive(mid);
										resp.should.have.property('message', `Message ${mid} has been archived.`);

										const rest = await client.restore(mid);
										rest.should.have.property('message', `Message ${mid} was restored.`);

										const del = await client.delete(mid);
										del.should.have.property('message', `Message ${mid} was deleted.`);

									});

								});
							});


						});
					});
				});
			});


		});


	});
});

/*


const cli = new MyContentClient('t07i2dpMi5Pftf0XTO9xaVzbeOUuLMMe', 'tDVzKd4d4yEs9vNFfNZsYIvDk7toos3MVxTLpz48bAKdKlowWEiYDm2JkxzSTYgh');
cli.setUrl('http://localhost');
cli.setVersion('wall_api_v1');
cli.information().then(res => {
	console.log(res);

}).catch(err => {
	console.log(err.status);
	err.json().then(er => console.log(er));
});
*/