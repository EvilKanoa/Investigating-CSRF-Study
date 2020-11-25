This web demonstration provides a simple implementation of a web chat application.

This web chat app uses WebSockets (with the Socket.IO library) to provide a live chat interface. Users provide a simple "username" identifier and the server allows communication in a global chat space. The entire message history and user list is handled in-memory, so no persistance is available.

Users can send text messages or images through the use of a URL. This small image feature provides an entry point for a CSRF based attack. This web chat is not vulnerable to XSS, but despite that, any users of both this web chat and the demo bank app will be vulnerable to a CSRF that may be carried out by any other user on the web chat.
