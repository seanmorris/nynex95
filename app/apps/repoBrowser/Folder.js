import { View } from 'curvature/base/View';
import { Bindable } from 'curvature/base/Bindable';
import { GitHub } from '../gitHub/GitHub';

export class Folder extends View
{
	constructor(args = {})
	{
		super(args);

		this.args.expanded = false;

		this.args.files = [];

		this.args.icon = args.icon || '/w95/4-16-4bit.png';
		this.args.name = args.name || 'Root';
		this.args.url  = args.url  || 'https://nynex.unholysh.it/github-proxy/repos/seanmorris/nynex95/contents?ref=master&t=' + Date.now();
		// this.args.url  = args.url  || 'https://red-cherry-cb88.unholyshit.workers.dev/repos/seanmorris/nynex95/contents?ref=master';
		// this.args.url  = args.url  || 'https://api.github.com/repos/seanmorris/nynex95/contents?ref=master';
		this.template  = require('./folder.tmp');
	}

	expand(event, child)
	{
		if(this.args.expanded)
		{
			this.args.icon = '/w95/4-16-4bit.png';
			this.args.expanded = false;
			return;
		}

		if(this.args.files.length)
		{
			this.args.icon = '/w95/5-16-4bit.png';
			this.args.expanded = true;
			return;
		}

		const headers = {};
		const gitHubToken = GitHub.getToken();

		if(gitHubToken && gitHubToken.access_token)
		{
			headers.Authorization = `token ${gitHubToken.access_token}`;
		}

		const url = this.args.url;

		fetch(url, {headers}).then(r => r.json()).then(files => {

			if(!Array.isArray(files))
			{
				this.args.browser.window.args.content  = '';
				this.args.browser.window.args.filename = '';
				this.args.browser.window.args.content  = 'loading...';

				const url = files.download_url + (files.download_url.match(/\?/)
					? '&t='
					: '?t='
				) + Date.now();

				fetch(url).then(r => r.text()).then(body => {

					this.args.browser.window.args.content  = '';
					this.args.browser.window.args.filename = '';

					this.args.browser.window.args.meta     = files;
					this.args.browser.window.args.content  = body;
					this.args.browser.window.args.filename = files.name;

				});

				return;
			}

			files.sort((a, b) => {

				if(a.type !== 'dir' && b.type !== 'dir')
				{
					return 0;
				}

				if(a.type !== 'dir')
				{
					return 1;
				}

				if(b.type !== 'dir')
				{
					return -1;
				}

			});

			this.args.files = [];

			files.map((file, key) => {
				const browser = this.args.browser;

				const url  = file.url;
				const name = file.name;
				const icon = file.type === 'dir'
					? '/w95/4-16-4bit.png'
					: '/w95/60-16-4bit.png';

				const folder = new Folder({browser, url, name, icon});

				this.onTimeout(key * 15, ()=>{
					this.args.files.push(folder);
				});
			});

			this.args.icon = '/w95/5-16-4bit.png';
			this.args.expanded = true;
		});
	}
}
