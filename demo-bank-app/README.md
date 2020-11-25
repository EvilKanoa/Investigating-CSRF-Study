This web application implements a demonstration of an online banking application.

The banking up runs as a static HTML site on port 8080.
It includes a home screen with common actions that are Login, View Balance, Send Transfer, and Logout. This provides a MVP that may be used as a demo of a real banking app.

When logging in, only one static set of credentials are available, listed below:
```
Username: bankuser
Password: csrfstudy
```

After logging in, the bank app will store a cookie under the name "token" with a randomly generated string. This string is also stored on the server to provide a user session identifier. All bank actions (View Balance and Send Transfer) require a valid and known token value to be included in the requests. This provides the security for our banking app. You may use the logout option to clear all current login cookies.

Please note that both login sessions and account balance are stored in-memory and will thus reset every time the server is restarted.
