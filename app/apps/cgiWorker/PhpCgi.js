import PHP from 'php-cgi-wasm/php-cgi-worker-drupal';
import parseResponse from './parseResponse';

const putEnv = (php, key, value) => php.ccall(
	'wasm_sapi_cgi_putenv'
	, 'number'
	, ['string', 'string']
	, [key, value]
);

export class PhpCgi
{
	rewrite    = path => path;
	processing = null
	docroot    = null;
	php        = null;

	input  = [];
	output = [];
	error  = [];

	cookies = new Map;

	count = 0;

	completions = new Map;
	inFlight = new Set;
	queue = [];

	loadPhp()
	{
		const mountPath = '/persist';

		this.php = new PHP({
			stdin:   () => this.input ? String(this.input.shift()).charCodeAt(0) : null, ...this.phpArgs
			, stdout: x => this.output.push(String.fromCharCode(x))
			, printErr: line => console.warn(line)
			, persist: {mountPath}
		}).then(p => {
			p.ccall('pib_storage_init' , 'number' , [] , [] );
			p.ccall('wasm_sapi_cgi_init' , 'number' , [] , [] );

			return p;
		});
	}

	constructor({docroot, rewrite, ...args} = {})
	{
		this.loadPhp();

		this.docroot = docroot || '';
		this.rewrite = rewrite || this.rewrite;
		this.phpArgs = args;
	}

	enqueue({url, filename, method = 'GET', path = '', get, post, contentType = ''})
	{
		const request = {url, filename, method, path, get, post, contentType};
		const completion = new Promise((accept, reject) => this.completions.set(request, {accept, reject}));

		const runRequest = () => {
			this.inFlight.add(runRequest);
			const doReq = this.request(request)

			doReq
			.finally(() => {
				this.inFlight.delete(runRequest);

				if(this.queue.length)
				{
					const next = this.queue.shift();
					next();
				}
			});

			doReq
			.then(result => this.completions.get(request).accept(result))
			.catch(error => this.completions.get(request).reject(error));

			return doReq;
		};

		if(this.inFlight.size)
		{
			this.queue.push(runRequest);
		}
		else
		{
			runRequest();
		}

		return completion;
	}

	async request({url, filename, method = 'GET', path = '', get, post, contentType = '', signal = null})
	{
		path = this.rewrite(path);

		if(!path && !filename)
		{
			path = '/index.php';
		}

		if(path[0] !== '/')
		{
			path = '/' + path;
		}

		if(!filename)
		{
			filename = this.docroot + path;
		}

		const cache  = await caches.open('static-v1');
		const cached = await cache.match(url);

		if(cached)
		{
			const cacheTime = Number(cached.headers.get('x-php-wasm-cache-time'));

			if(45_000 < Date.now() - cacheTime)
			{
				return cached;
			}
		}

		const php       = await this.php;
		const originalFilename = filename;
		const aboutPath = php.FS.analyzePath(originalFilename);

		if(originalFilename.substr(-4) !== '.php')
		{
			// Return static file
			if(aboutPath.exists)
			{
				const response = new Response(php.FS.readFile(originalFilename, { encoding: 'binary', url }), {});

				response.headers.append('x-php-wasm-cache-time', new Date().getTime());

				cache.put(url, response.clone());

				return response;
			}

			// Rewrite to index
			filename = this.docroot + '/index.php';
		}

		{
			const docroot = this.docroot;

			putEnv(php, 'DOCROOT', docroot);
			putEnv(php, 'SERVER_SOFTWARE', navigator.userAgent);
			putEnv(php, 'REQUEST_METHOD', method);
			putEnv(php, 'REQUEST_URI', originalFilename);
			putEnv(php, 'REMOTE_ADDR', '127.0.0.1');
			putEnv(php, 'SCRIPT_NAME', filename);
			putEnv(php, 'SCRIPT_FILENAME', filename);
			putEnv(php, 'PATH_TRANSLATED', originalFilename);
			putEnv(php, 'QUERY_STRING', get);
			putEnv(php, 'HTTP_COOKIE', [...this.cookies.entries()].map(e => `${e[0]}=${e[1]}`).join(';') );
			putEnv(php, 'REDIRECT_STATUS', '200');
			putEnv(php, 'CONTENT_TYPE', contentType);
			putEnv(php, 'CONTENT_LENGTH', String(this.input.length));
		}

		return new Promise(accept => navigator.locks.request("php-persist", async (lock) => {

			this.input  = ['POST', 'PUT', 'PATCH'].includes(method) ? post.split('') : [];
			this.output = [];
			this.error  = [];

			console.log(signal);

			if(signal.aborted)
			{
				return accept();
			}

			await new Promise(accept => php.FS.syncfs(true, err => {
				if(err) console.warn(err);
				accept();
			}));

			console.log(lock);

			try
			{
				php._main();
			}
			catch (error)
			{
				console.warn(error);
				this.loadPhp();
			}


			await new Promise(accept => php.FS.syncfs(false, err => {
				if(err) console.warn(err);
				accept();
			}));

			++this.count;

			const parsedResponse = parseResponse(this.output.join(''));

			let status = 200;

			for(const [name, value] of Object.entries(parsedResponse.headers))
			{
				if(name === 'Status')
				{
					status = value.substr(0, 3);
				}
			}

			if(parsedResponse.headers['Set-Cookie'])
			{
				const raw = parsedResponse.headers['Set-Cookie'];
				const semi  = raw.indexOf(';');
				const equal = raw.indexOf('=');
				const key   = raw.substr(0, equal);
				const value = raw.substr(1 + equal, semi - equal);

				this.cookies.set(key, value);
			}

			const headers = { "Content-Type": parsedResponse.headers["Content-Type"] };

			if(parsedResponse.headers.Location)
			{
				headers.Location = parsedResponse.headers.Location;
			}

			accept(new Response(parsedResponse.body, { headers, status, url }));
		}));

	}

	async readdir(path)
	{
		const php = (await this.php);

		await new Promise(accept => php.FS.syncfs(true, err => {
			if(err) console.warn(err);
			accept();
		}));

		return php.FS.readdir(path);
	}

	async mkdir(path)
	{
		const php = (await this.php);

		await new Promise(accept => php.FS.syncfs(true, err => {
			if(err) console.warn(err);
			accept();
		}));

		const result = php.FS.mkdir(path);

		await new Promise(accept => php.FS.syncfs(false, err => {
			if(err) console.warn(err);
			accept();
		}));

		return result;
	}

	async rmdir(path)
	{
		const php = (await this.php);

		await new Promise(accept => php.FS.syncfs(true, err => {
			if(err) console.warn(err);
			accept();
		}));

		const result = php.FS.rmdir(path);

		await new Promise(accept => php.FS.syncfs(false, err => {
			if(err) console.warn(err);
			accept();
		}));

		return result;
	}

	async readFile(path)
	{
		const php = (await this.php);

		await new Promise(accept => php.FS.syncfs(true, err => {
			if(err) console.warn(err);
			accept();
		}));

		return php.FS.readFile(path);
	}

	async writeFile(path, data, options)
	{
		const php = (await this.php);

		await new Promise(accept => php.FS.syncfs(true, err => {
			if(err) console.warn(err);
			accept();
		}));

		const result = php.FS.writeFile(path, data, options);

		await new Promise(accept => php.FS.syncfs(false, err => {
			if(err) console.warn(err);
			accept();
		}));

		return result;
	}

	async unlink(path)
	{
		const php = (await this.php);

		await new Promise(accept => php.FS.syncfs(true, err => {
			if(err) console.warn(err);
			accept();
		}));

		const result = php.FS.unlink(path);

		await new Promise(accept => php.FS.syncfs(false, err => {
			if(err) console.warn(err);
			accept();
		}));

		return result;
	}
}
