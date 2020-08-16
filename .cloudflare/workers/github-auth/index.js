/**
 * Proxies requests to the github API through cloudflare.
 *
 * @TODO: Perform OAuth Secret Exchange.
 */

addEventListener('fetch', event => {
	const result = handleRequest(event.request);

	event.waitUntil(result);
	event.respondWith(result);

})

async function handleRequest(request) {

	const githubUrl = 'https://github.com/login/oauth/access_token';

	// client_id
	// client_secret
	// code
	// redirect_uri
	// state

	return fetch(githubUrl, {headers}).then(response => {

	});
	// return Promise.resolve((accept,reject) => {
	// });
}
