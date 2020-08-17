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
			, redirect_uri:  'https://github-auth.unholyshit.workers.dev/accept'
			, code:          GET.get('code')
			, state:         '---'
		}).map(

			([key, value]) => body.append(key, value)

		);

		const headers = new Headers({accept: 'application/json'});

		return fetch(authUrl, {method, headers, body}).then(r => r.text()).then(apiResponse => {
			const returnHtml = `<head><script>window.opener.postMessage('${apiResponse}', '*');</script></head><body>${apiResponse}</body>`
			return new Response(returnHtml, {
				headers: new Headers({'content-type': 'text/html'})
			});
		});
	}
}

addEventListener('fetch', event => {
	const result = handleRequest(event.request);
	event.waitUntil(result);
	event.respondWith(result);
});
