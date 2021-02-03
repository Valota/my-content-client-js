![Valotalive Logo](https://store.valotalive.com/img/valotalive_logo.png)

# Valotalive - Javascript (NodeJS) Client for My Content API

This is a helper library for [Valotalive](https://valota.live) Digital
Signage [My Content API](https://github.com/Valota/my-content-api). You have to have at least
one [My Content](https://valota.live/apps/my-content/) activated in our system to use this library.

## Requirements

See *dependencies* from [package.json](package.json)

## Installation

Use [npm](https://www.npmjs.com/)  
`npm install @valota/my-content-client`


## Usage

```javascript
const {MyContentClient, PostMessage, PDFPage} = require('@valota/my-content-client');

// Initialize your client
const client = new MyContentClient(API_KEY, API_SECRET);


// get basic information
client.information().then(res => {
	console.log(res);
}).catch(err => {
	console.log(err.status);
	err.json().then(er => console.log(er));
});





// Post
const post = new PostMessage();
post.setTitle("Title of the post");
post.setMessage("Message of the post");
post.setMedia('/abs/path/to/media.jpg');
post.setDisplayTime(10);//seconds
post.setDurationFrom(1609855473);//seconds since unix epoch 
post.setDurationTo(1609865473);//seconds since unix epoch 
// All are optional, but post has to have at least one of title, message or media.
client.post(post).then(res => {
	console.log(res);
}).catch(err => {
	console.log(err.status);
	err.json().then(er => console.log(er));
});


// Edit

const edit = new EditMessage();
edit.setTitle("Edited title");// empty string unsets
edit.setMessage("Edited message");// empty string unsets
edit.setDisplayTime(0);// 0 unsets
edit.setDurationFrom(0);// 0 unsets 
edit.setDurationTo(0);// 0 unsets 
// All are optional. Only changes the values that are set.
client.edit(edit).then(res => {
	console.log(res);
}).catch(err => {
	console.log(err.status);
	err.json().then(er => console.log(er));
});



// List all messages
client.list().then(res => {
	console.log(res);
}).catch(err => {
	console.log(err.status);
	err.json().then(er => console.log(er));
});

// Get one message
client.get(messageId).then(res => {
	console.log(res);
}).catch(err => {
	console.log(err.status);
	err.json().then(er => console.log(er));
});

// Archive a message
client.archive(messageId).then(res => {
	console.log(res);
}).catch(err => {
	console.log(err.status);
	err.json().then(er => console.log(er));
});

// Restore a message from the archive
client.restore(messageId).then(res => {
	console.log(res);
}).catch(err => {
	console.log(err.status);
	err.json().then(er => console.log(er));
});

// Delete a message permanently
client.delete(messageId).then(res => {
	console.log(res);
}).catch(err => {
	console.log(err.status);
	err.json().then(er => console.log(er));
});
```
>API description has more detailed information about responses and arguments at https://github.com/Valota/my-content-api

## Links

- **Valotalive**: https://valota.live
- **My Content Channel**: https://valota.live/apps/my-content/
- **My Content API description**: https://github.com/Valota/my-content-api