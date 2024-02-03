export const mapUri = uri => {

	const parsedUri = new URL(uri);

	switch(parsedUri.protocol)
	{
		case 'githubfs:':
		{
			const pathname = parsedUri.pathname.substr(2);

			return `https://api.github.com/repos/${pathname}${parsedUri.search}`;
		;
		} break;
	}
};
