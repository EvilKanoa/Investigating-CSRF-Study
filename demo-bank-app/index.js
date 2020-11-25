const express = require('express');
const path = require('path');

/* controls the exact configuration used when saving the access token as a cookie */
const cookieConfig = {
	expires: 0, // create a session-only cookie
	httpOnly: false, // allow JS/AJAX usage of cookie for demo purposes (bad practice though)
	secure: false, // allow non-HTTPS requests to use this cookie (DO NOT SET TO FALSE IN REAL WORLD)
};

/* determines whether money transfer can be sent using HTTP GET requests, may need to update HTML if false */
const allowGetTransfer = true;
/* whether negative balances are enabled */
const allowNegativeBalance = false;

/* data object will contain the entire state of our bank app */
const data = {
	balance: 123456,
	tokens: [],
};

const makeTempPage = (content = '', location = '/', delay = 3, keyword = 'Redirecting') => `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="utf-8">
			<meta http-equiv="refresh" content="${delay};url=${location}" />
			<title>Demo Banking App - CSRF Study Demo</title>
		</head>
		<body style="background-color: cyan;">
			<div style="margin-left: auto; margin-right: auto; margin-top: 2rem; max-width: 56rem;">
				${content}
				<br/>
				<p style="font-size: 75%;">${keyword} in ${delay} second(s)...</p>
			</div>
		</body>
	</html>
`;

const generateAccessToken = (length = 128, chars = 'abcdefghijklmnopqrstuvwxyz0123456789') => {
	let key = '';
	for (let i = 0; i < length; i++) {
		key = key + chars[Math.floor(Math.random() * chars.length)];
	}
	return key;
};

(async () => {
	/* generic express server setup */
	const app = express();
	app.use(require('morgan')('common'));
	app.use(require('cookie-parser')());
	app.use(require('body-parser').json());
	app.use(require('body-parser').urlencoded({ extended: true }));

	/* add custom route(s) */
	app.use(express.static(path.resolve(__dirname, 'public')));
	app.post('/do_login.html', (req, res) => {
		if (req.body && req.body.username === 'bankuser') {
			if (req.body.password === 'csrfstudy') {
				const token = generateAccessToken();
				data.tokens.push(token);
				res.cookie('token', token, cookieConfig)
					.send(makeTempPage('Logged in successfully!', '/'));
			} else {
				res.send(makeTempPage('Unknown password, please try again!', '/login.html'));
			}
		} else {
			res.send(makeTempPage('Unknown user name, please try again!', '/login.html'));
		}
	});
	app.get('/balance.html', (req, res) => {
		if (req.cookies && data.tokens.includes(req.cookies.token)) {
			res.send(makeTempPage(`You're account balance is currently: $${data.balance}`, '/balance.html', 10, 'Refreshing'));
		} else {
			res.send(makeTempPage('You must be logged in to view this page!', '/'));
		}
	});
	app.get('/logout.html', (_req, res) => {
		res.clearCookie('token', cookieConfig)
			.send(makeTempPage('You have been successfully logged out...', '/'));
	});
	const doTransfer = (req, res) => {
		const txn = { ...(req.query || {}), ...(req.body || {}) };
		if (req.cookies && data.tokens.includes(req.cookies.token)) {
			if (txn.recipient && txn.recipient.length && txn.amount && txn.amount.length) {
				const amount = txn.amount - 0; // cast to number
				if (data.balance < amount && !allowNegativeBalance) {
					res.send(makeTempPage('Failed! Not enough balance in account...', '/setup_transfer.html'));
				} else {
					data.balance -= amount;
					res.send(makeTempPage(`You've sent $${amount} to ${txn.recipient}!`, '/'));
				}
			} else {
				res.send(makeTempPage('You must enter a recipient email as well as an amount!', '/setup_transfer.html'));
			}
		} else {
			res.send(makeTempPage('You must be logged in to view this page!', '/'));
		}
	};
	app.post('/do_transfer.html', doTransfer);
	if (allowGetTransfer) {
		app.get('/do_transfer.html', doTransfer);
	}

	/* begin listening for incoming requests */
	app.listen(8080, () => console.log('Server listening on port 8080!'));
})()
	.then(() => console.log('Bank app server setup complete!'))
	.catch(err => console.error('Encountered a fatal error during setup!\n', err));
