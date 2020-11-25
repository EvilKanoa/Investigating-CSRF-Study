const express = require('express');
const path = require('path');

let users = [];
const messages = [
	{
		username: 'Server',
		type: 'text',
		text: 'Welcome to the chat room, all prior messages will be loaded at first...',
	},
	{
		username: 'Server',
		type: 'text',
		text: 'Here is a cat picture to hold you over!',
	},
	{
		username: 'Server',
		type: 'image',
		url: 'https://static.scientificamerican.com/sciam/cache/file/92E141F8-36E4-4331-BB2EE42AC8674DD3_source.jpg',
	},
];

(async () => {
	/* express server setup with websockets */
	const app = express();
	const http = require('http').createServer(app);
	const io = require('socket.io')(http);

	app.use(require('morgan')('common'));
	app.use(require('body-parser').json());
	app.use(require('body-parser').urlencoded({ extended: true }));

	/* add custom route(s) */
	app.use(express.static(path.resolve(__dirname, 'public')));

	/* add websocket handlers */
	io.on('connection', (socket) => {
		const updateUsers = () => io.emit(
			'users',
			JSON.stringify(
				users.filter(user => user.username)
					.map(({ username }) => username)
			)
		);

		let user = { id: socket.id };
		users = [ ...users, user ];
		socket.on('disconnect', () => {
			users = users.filter(({ id }) => id !== socket.id );
			updateUsers();
		});

		socket.on('id', (username) => {
			if (typeof username === 'string' && username.length > 0) {
				user.username = username;
				updateUsers();
			}
		});

		socket.on('request-messages', () => {
			messages.forEach((message) => {
				socket.emit('message', JSON.stringify(message));
			});
		});

		socket.on('message', rawData => {
			const data = JSON.parse(rawData);
			if (!data || !data.type) {
				return;
			}

			const message = {
				type: data.type,
				username: user.username || 'Connecting...',
			};

			switch (message.type) {
				case 'text':
					message.text = data.text;
					break;
				case 'image':
					message.url = data.url;
					break;
				default:
					return;
			}

			messages.push(message);
			io.emit('message', JSON.stringify(message));
		});
	});

	/* begin listening for incoming requests */
	http.listen(8082, () => console.log('Server listening on port 8082!'));
})()
	.then(() => console.log('Chat app server setup complete!'))
	.catch(err => console.error('Encountered a fatal error during setup!\n', err));
