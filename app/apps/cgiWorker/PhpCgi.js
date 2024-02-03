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

	constructor({docroot, rewrite, cookies, ...args} = {})
	{
		this.docroot = docroot || '';
		this.cookies = cookies || '';
		this.rewrite = rewrite || this.rewrite;
		this.phpArgs = args;

		this.maxRequestAge = args.maxRequestAge || 0;
		this.staticCacheTime = args.staticCacheTime || 0;
		this.dynamicCacheTime = args.dynamicCacheTime || 0;

		this.env = {};

		Object.assign(this.env, args.env || {});

		this.loadPhp();
	}

	async loadPhp()
	{
		const mountPath = '/persist';

		this.php = new PHP({
			stdin:   () => {
				return this.input
				? String(this.input.shift()).charCodeAt(0)
				: null
			}
			, stdout: x => this.output.push(String.fromCharCode(x))
			, stderr: x => console.warn(String.fromCharCode(x))
			, persist: {mountPath}
			,...this.phpArgs
		})

		const php = await this.php;

		return new Promise((accept,reject) => navigator.locks.request('php-persist', () => {
			php.ccall('pib_storage_init' , 'number' , [] , [] );
			php.ccall('wasm_sapi_cgi_init' , 'number' , [] , [] );
			php.FS.mkdir('/config');
			php.FS.syncfs(true, err => {
				if(err) reject(err);
				else accept(php);
			});
		}));
	}

	async request({event, url, filename, method = 'GET', path = '', get, post, contentType = '', signal = null})
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

			if(120_000 < Date.now() - cacheTime)
			{
				return cached;
			}
		}

		const php = await this.php;
		const originalFilename = filename;

		return new Promise(async accept => {

			if(originalFilename.substr(-4) !== '.php')
			{
				const aboutPath = php.FS.analyzePath(originalFilename);

				// Return static file
				if(aboutPath.exists)
				{
					const response = new Response(php.FS.readFile(originalFilename, { encoding: 'binary', url }), {});

					response.headers.append('x-php-wasm-cache-time', new Date().getTime());

					cache.put(url, response.clone());

					accept(response);
					return;
				}

				// Rewrite to index
				filename = this.docroot + '/index.php';
			}

			await navigator.locks.request('php-persist', async () => {

				const docroot = this.docroot;

				this.input  = ['POST', 'PUT', 'PATCH'].includes(method) ? post.split('') : [];
				this.output = [];
				this.error  = [];

				// putEnv(php, 'PHP_INI_SCAN_DIR', '/conf');
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

				try
				{
					const exitCode = php._main();

					if(exitCode === 0)
					{
						await new Promise((accept,reject) => php.FS.syncfs(false, err => {
							if(err) reject(err);
							else accept();
						}));
					}
				}
				catch (error)
				{
					console.warn(error);
					this.loadPhp();
					accept(new Response('ERR', { status: 500 }));
					return;
				}

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
	 		})
		});

	}

	async analyzePath(path)
	{
		const result = (await this.php).FS.analyzePath(path);

		console.log(result);

		return {...result, object: undefined, parentObject: undefined};
	}

	async readdir(path)
	{
		return (await this.php).FS.readdir(path);
	}

	async readFile(path)
	{
		return (await this.php).FS.readFile(path);
	}

	async mkdir(path)
	{
		const php = (await this.php);

		const result = php.FS.mkdir(path);

		return new Promise(accept => navigator.locks.request('php-persist', () => {
			php.FS.syncfs(false, err => {
				if(err) throw err;
				accept(result);
			});
		}));
	}

	async rmdir(path)
	{
		const php = (await this.php);

		const result = php.FS.rmdir(path);

		return new Promise(accept => navigator.locks.request('php-persist', () => {
			php.FS.syncfs(false, err => {
				if(err) throw err;
				accept(result);
			});
		}));
	}

	async writeFile(path, data, options)
	{
		const php = (await this.php);

		const result = php.FS.writeFile(path, data, options);

		return new Promise(accept => navigator.locks.request('php-persist', () => {
			php.FS.syncfs(false, err => {
				if(err) throw err;
				accept(result);
			});
		}));
	}

	async unlink(path)
	{
		const php = (await this.php);

		const result = php.FS.unlink(path);

		return new Promise(accept => navigator.locks.request('php-persist', () => {
			php.FS.syncfs(false, err => {
				if(err) throw err;
				accept(result);
			});
		}));
	}

	async putEnv(name, value)
	{
		const php = (await this.php);

		return php.ccall('wasm_sapi_cgi_putenv', 'number', ['string', 'string'], [name, value]);
	}

	async getSettings()
	{
		return {
			docroot: this.docroot
			, maxRequestAge: this.maxRequestAge
			, staticCacheTime: this.staticCacheTime
			, dynamicCacheTime: this.dynamicCacheTime
		};

	}

	async setSettings({docroot, maxRequestAge, staticCacheTime, dynamicCacheTime})
	{
		this.docroot = docroot ?? this.docroot;
		this.maxRequestAge = maxRequestAge ?? this.maxRequestAge;
		this.staticCacheTime = staticCacheTime ?? this.staticCacheTime;
		this.dynamicCacheTime = dynamicCacheTime ?? this.dynamicCacheTime;
	}

	async getEnvs()
	{
		console.log({...this.env});
		return {...this.env};
	}

	async setEnvs(env)
	{
		for(const key of Object.keys(this.env))
		{
			this.env[key] = undefined;
		}

		Object.assign(this.env, env);
	}

	async refresh()
	{
		this.loadPhp();
	}

	async storeInit()
	{
		const settings = await this.getSettings();
		const env = await this.getEnvs();
		const ini = await this.readFile('/config/php.ini', {encoding: 'utf8'});

		this.writeFile('/config/init.json', JSON.stringify({settings, env, ini}), {encoding: 'utf8'});
	}

	async loadInit()
	{

	}
}

/*
export const PHP_INI_STAGE_STARTUP = (1<<0);
export const PHP_INI_STAGE_SHUTDOWN = (1<<1);
export const PHP_INI_STAGE_ACTIVATE = (1<<2);
export const PHP_INI_STAGE_DEACTIVATE = (1<<3);
export const PHP_INI_STAGE_RUNTIME = (1<<4);
export const PHP_INI_STAGE_HTACCESS = (1<<5);
*/
