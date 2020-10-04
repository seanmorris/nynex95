addEventListener('fetch', event => {
	const result = handleRequest(event.request);

	event.waitUntil(result);
	event.respondWith(result);

})

async function handleRequest(request) {
	const originalUrl = new URL(request.url);
	const githubUrl   = 'https://api.github.com'
		+ originalUrl.pathname.replace(/^\/github-proxy/, '')
		+ originalUrl.search;

	const headers = new Headers();
	const method  = request.method;
	const body    = request.body;

	headers.append('Cache-Control', 'no-cache');
	headers.append('User-Agent',    'node.js');
	headers.append('pragma',        'no-cache');

	return fetch(githubUrl, {method, headers: request.headers, body}).then(response => {

		return response.text().then(responseText => {
			return {response, responseText};
		});

	}).then(({response, responseText}) => {

		const headers = new Headers(response.headers);

		headers.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
		headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS, PUT, DELETE');
		headers.set('Access-Control-Allow-Origin', '*');

		const rawBody = responseText.replace(/api\.github\.com/g, originalUrl.host + '/github-proxy');

		if(originalUrl.searchParams.get('api') == 'json-async')
		{
			headers.set('Cache-Control', 'no-cache');
			headers.set('Content-Type',  'text/event-stream');
			headers.set('Connection',    'keep-alive');

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

				writer.close();
			}
			else
			{
				writer.write(encoder.encode('data: ' + rawBody + '\n\n'));

				writer.close();
			}

			return new Response(readable, {
				status:       response.status
				, statusText: response.statusText
				, headers
			});
		}

		return new Response(rawBody, {headers});
	});
}
