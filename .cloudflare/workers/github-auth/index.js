async function handleRequest(request)
{
	const url = new URL(request.url);
	const GET = url.searchParams;

	const sessionKey = crypto.getRandomValues(new Uint8Array(256)).join('');

	if('/accept' === url.pathname)
	{
		const authUrl = 'https://github.com/login/oauth/access_token';
		const method  = 'POST';
		const body    = new FormData;

		Object.entries({
			client_id:       GHAPI_CLIENT_ID
			, client_secret: GHAPI_CLIENT_SECRET
			, code:          GET.get('code')
			, redirect_uri:  'https://github-auth.unholyshit.workers.dev/accept'
			, state:         '---'
		}).map(([key, value])=>{
			body.append(key, value);
		})

		const headers = new Headers({});

		return fetch(authUrl, {method, headers, body}).then(r => r.text()).then(apiResponse => {
			return new Response(apiResponse, {
				headers: new Headers({'content-type': 'html'})
			});
		});
	}
}

addEventListener('fetch', event => {
	const result = handleRequest(event.request);
	event.waitUntil(result);
	event.respondWith(result);
});
