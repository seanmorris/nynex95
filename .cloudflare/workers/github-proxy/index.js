/**
 * Proxies requests to the github API through cloudflare.
 *
 * @TODO: Perform OAuth Secret Exchange.
 */

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
	const originalUrl = new URL(request.url);
	const githubUrl   = 'https://api.github.com' + originalUrl.pathname;

	const headers = new Headers(request.headers);

	headers.append('User-Agent',    'node.js');
	headers.append('Cache-Control', 'no-cacheche');

	return fetch(githubUrl, {headers}).then(response => {

		return new Promise(accept => {
			response.text().then(responseText => {
				accept({response, responseText})
			});
		});

	}).then(({response, responseText}) => {

		const headers = new Headers(response.headers);
		const rawBody = responseText.replace(/api\.github\.com/g, originalUrl.host);

		if(originalUrl.searchParams.get('api') == 'json-source')
		{
			headers.append('Content-Type',  'text/event-stream');
			headers.append('Cache-Control', 'no-cache');
			headers.append('Connection',    'keep-alive');

			headers.append('Access-Control-Allow-Origin', '*');
			headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

			const { readable, writable } = new TransformStream();
			const writer = writable.getWriter();
			const encoder = new TextEncoder();

			const parsedBody = JSON.parse(rawBody);

			if(Array.isArray(parsedBody))
			{
				writer.write(encoder.encode('data: ' + JSON.stringify({count:parsedBody.length}) + '\n\n'));

				for(const line of parsedBody)
				{
					writer.write(encoder.encode('data: ' + JSON.stringify(line) + '\n\n'));
				}
			}
			else
			{
				writer.write(encoder.encode('data: ' + rawBody + '\n\n'));
			}

			return new Response(readable, {
				'status':       200
				, 'statusText': 'ok'
				, 'headers':     headers
			});
		}

		return new Response(rawBody, {headers:response.headers});
	});
}
