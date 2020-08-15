/**
 * Proxies requests to the github API through cloudflare.
 *
 * @TODO: Perform OAuth Secret Exchange.
 */

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
	const original = new URL(request.url);
	const newUrl   = 'https://api.github.com' + original.pathname;

	return fetch(newUrl, {headers: new Headers({'User-Agent': 'node.js'})})
		.then(response => {

			return new Promise(accept => {
				response.text().then(responseText => {
					accept({response, responseText})
				});
			});

		}).then(({response, responseText}) => {

			const { readable, writable } = new TransformStream();

			const writer = writable.getWriter();
			const encoder = new TextEncoder();

			const headers = new Headers(response.headers);

			headers.append('Content-Type', 'text/event-stream');
			headers.append('Cache-Control', 'no-cache');
			headers.append('Connection', 'keep-alive');
			headers.append('Access-Control-Allow-Origin', '*');
			headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

			const raw  = responseText.replace(/api\.github\.com/g, original.host);
			const body = JSON.parse(raw);

			if(Array.isArray(body))
			{
				for(const line of body)
				{
					writer.write(encoder.encode('data: ' + JSON.stringify(line) + '\n\n'));
				}
			}
			else
			{
				writer.write(encoder.encode('data: ' + raw + '\n\n'));
			}

			return new Response(readable, {
				'status':       200
				, 'statusText': 'ok'
				, 'headers':     headers
			});

			// return new Response(
			//
			// 	, {headers:response.headers}
			// );

		});
}
