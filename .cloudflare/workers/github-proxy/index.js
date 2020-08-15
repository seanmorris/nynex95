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

	console.log(request.hostname, newUrl);

	return fetch(newUrl, {headers: new Headers({'User-Agent': 'node.js'})})
		.then(response => {

			return new Promise(accept => {
				response.text().then(responseText => {
					accept({response, responseText})
				});
			});

		}).then(({response, responseText}) => {

			return new Response(
				responseText.replace(/api\.github\.com/g, original.host)
				, {headers:response.headers}
			);

		});
}
