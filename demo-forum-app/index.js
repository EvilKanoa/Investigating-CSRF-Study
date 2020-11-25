const express = require('express');
const path = require('path');

(async () => {
	/* generic express server setup */
	const app = express();
	app.use(require('morgan')('common'));
	app.use(require('body-parser').json());
	app.use(require('body-parser').urlencoded({ extended: true }));

	/* add custom route(s) */
	app.use(express.static(path.resolve(__dirname, 'public')));

	/* begin listening for incoming requests */
	app.listen(8081, () => console.log('Server listening on port 8081!'));
})()
	.then(() => console.log('Forum app server setup complete!'))
	.catch(err => console.error('Encountered a fatal error during setup!\n', err));
