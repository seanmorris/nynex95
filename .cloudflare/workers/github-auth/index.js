addEventListener('fetch', event => {
	const result = handleRequest(event.request);
	event.waitUntil(result);
	event.respondWith(result);
});

async function handleRequest(request) {

	const sessionKey = crypto.getRandomValues(new Uint8Array(256)).join('');
	const githubUrl  = 'https://github.com/login/oauth/access_token';

	const url = new URL(request);
	const GET = url.searchParams;

	const headers = new Headers();
	const method  = 'POST';
	const body    = JSON.stringify({
		client_id:       GHAPI_CLIENT_ID
		, client_secret: GHAPI_CLIENT_SECRET
		, code:          GET.get('code')
		, redirect_uri:  'https://github-auth.unholyshit.workers.dev/'
		, state:         '---'
	});

	// AUTH_KV;

	return fetch(githubUrl, {method, headers, body}).then(r => r.text()).then(apiResponse => {

		console.log(apiResponse);

		return new Response(apiResponse, {
			headers: new Headers({'content-type': 'plaintext'})
		});

	});

	// return Promise.resolve((accept,reject) => {
	// });
}
