addEventListener('fetch', event => {
	const result = handleRequest(event.request);
	event.waitUntil(result);
	event.respondWith(result);
});

async function handleRequest(request) {

	const sessionKey = crypto.getRandomValues(new Uint8Array(256)).join('');

	const githubUrl = 'https://github.com/login/oauth/access_token';

	const headers = new Headers();
	const method  = 'POST';
	const body    = JSON.stringify({
		client_id:     '7150d20fb5a11fe1d332'
		client_secret: ''
		code:          ''
		redirect_uri:  ''
		state:         ''
	});

	// AUTH_KV;

	return fetch(githubUrl, {method, headers, body}).then(r => r.text()).then(r => {

		console.log(r);

		return new Response('ok.');

	});

	// return Promise.resolve((accept,reject) => {
	// });
}
