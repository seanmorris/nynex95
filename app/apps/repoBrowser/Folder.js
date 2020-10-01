import { Router } from 'curvature/base/Router';
import { View } from 'curvature/base/View';
import { Bindable } from 'curvature/base/Bindable';
import { GitHub } from '../gitHub/GitHub';

import { Icon } from '../../icon/Icon';
import { Icons as IconControl } from '../../control/Icons';

export class Folder extends View
{
	constructor(args = {}, parent = null)
	{
		super(args, parent);

		this.files = {};

		this.args.expanded = args.expanded;

		this.args.files = [];

		if(args.file && args.file.type === 'file')
		{
			this.args.icon = '/w95/60-16-4bit.png';
		}
		else
		{
			this.args.icon = '/w95/4-16-4bit.png';

			if(this.args.expanded)
			{
				this.args.icon = '/w95/5-16-4bit.png';
			}
		}

		this.args.name = args.name || '.';
		this.args.url  = args.url  || '';
		this.args.file = args.file || null;
		// this.args.url  = args.url  || 'https://nynex.unholysh.it/github-proxy/repos/seanmorris/nynex95/contents?ref=master&t=' + Date.now();
		// this.args.url  = args.url  || 'https://red-cherry-cb88.unholyshit.workers.dev/repos/seanmorris/nynex95/contents?ref=master';
		// this.args.url  = args.url  || 'https://api.github.com/repos/seanmorris/nynex95/contents?ref=master';
		this.template  = require('./folder.tmp');
	}

	select(event, child)
	{
		if(event)
		{
			event.stopImmediatePropagation();
			event.stopPropagation();
		}

		this.args.browser.current = this;

		this.populate(this.args.url).then((files)=>{

			if(!Array.isArray(files))
			{
				return;
			}

			if(this.args.file)
			{
				Router.go(
					`/${this.args.browser.cmd}`
					+`/${this.args.browser.username}`
					+`/${this.args.browser.reponame}`
					+`/${this.args.file.path}`
					, 2
				);
			}

			const iconList = new IconControl({}, this);

			const icons = files.map((file, key) => {
				const name = file.name;
				const action = () => {

					if(file.type === 'dir')
					{
						if(this.files[name])
						{
							this.files[name].expand(event, child, this, true);
							this.files[name].select();


							return;
						}
					}
					else if(file.download_url)
					{
						this.showControl(file, this);
					}

				};

				const icon = new Icon({icon:file.type === 'dir' ? 4:60, name, action});

				this.onTimeout(key * 20, () => {
					iconList.args.icons.push(icon);
				});

				return icon;
			});

			this.args.browser.window.args.filename = this.args.name;
			this.args.browser.window.args.control = iconList;
		});
	}

	expand(event, child, dir, open = undefined)
	{
		if(this.expanding)
		{
			return this.expanding;
		}

		this.expanding = new Promise((accept) => {

			if(this.args.file && this.args.file.type === 'dir')
			{
				if(open === true)
				{
					this.args.expanded = true;
					this.args.icon     = '/w95/5-16-4bit.png';
				}
				else if(open === false)
				{
					this.args.expanded = false;
					this.args.icon     = '/w95/4-16-4bit.png';
				}
				else if(this.args.expanded)
				{
					this.args.icon = '/w95/4-16-4bit.png';
					this.args.expanded = false;
				}
				else
				{
					this.args.icon     = '/w95/5-16-4bit.png';
					this.args.expanded = true;
				}
			}

			this.populate(this.args.url).then((files)=>{

				if(event)
				{
					event.stopImmediatePropagation();
					event.stopPropagation();
				}

				this.expanding = false

				if(this.args.file && this.args.file.type === 'file')
				{
					this.showControl(this.args.file, dir);
				}

				accept();
			});
		});
	}

	showControl(file, dir)
	{
		const name = file.name;
		const type = name.split('.').pop();

		// this.args.browser.window.args.filename = '';
		this.args.browser.window.args.content  = 'loading...';
		this.args.browser.window.args.url      = '';

		const gitHubToken = GitHub.getToken();

		const headers = {};

		const renderable = (type === 'md' || type === 'html');

		headers.Accept = 'application/vnd.github.v3.raw';


		// if(type === 'md')
		// {
		// 	headers.Accept = 'application/vnd.github.v3.html+json';
		// }

		// if(type === 'html')
		// {
		// 	headers.Accept = 'application/vnd.github.v3.raw+json';
		// }

		// if(renderable && gitHubToken && gitHubToken.access_token)
		// {
		// 	headers.Authorization = `token ${gitHubToken.access_token}`;
		// }

		const url = renderable
			? file.url
			: file.download_url;

		if(file.path)
		{
			console.log(file.path);
			const path = `/${this.args.browser.repoName}/${file.path}`;
			Router.go(`/${this.args.browser.cmd}${path}`, 2);
		}


		// this.args.browser.path = path;

		// console.log(this.args.browser.cmd, path);


		this.args.browser.window.args.url = url;

		fetch(url, {headers}).then(r => r.text()).then(body => {
			this.args.browser.window.args.content  = body;
			this.args.browser.window.args.sha      = file.sha;
			this.args.browser.window.args.filename = file.name;
			this.args.browser.parent               = dir;
		});
	}

	populate(url)
	{
		if(this.populating)
		{
			return this.populating;
		}

		const gitHubToken = GitHub.getToken();

		const headers = {
			accept: 'application/vnd.github.v3.json'
		};

		if(gitHubToken && gitHubToken.access_token)
		{
			headers.authorization = `token ${gitHubToken.access_token}`;
		}

		this.args.files = [];

		return this.populating = fetch(url, {headers}).then(r => r.json()).then(files => {
			if(Array.isArray(files))
			{
				this.dir = true;

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

				files.map((file, key) => {
					const name = file.name;

					const img  = file.type === 'dir'
						? '/w95/4-16-4bit.png'
						: '/w95/60-16-4bit.png';

					const folder = new Folder({
						browser: this.args.browser
						, url: file.url
						, name
						, icon: img
						, file
					}, this);

					this.files[name] = folder;

					this.onTimeout(key * 20, () => this.args.files.push(folder));

				});

				return new Promise(accept => {
					this.onTimeout(files.length*20, () => accept(files));
				});
			}


			this.dir = false;

		});
	}
}
