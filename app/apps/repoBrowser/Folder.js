import { View } from 'curvature/base/View';
import { Bindable } from 'curvature/base/Bindable';

export class Folder extends View
{
	constructor(args = {})
	{
		super(args);

		this.args.expanded = false;

		this.args.icon = args.icon || '/w95/4-16-4bit.png';
		this.args.name = args.name || 'Root';
		this.args.url  = args.url  || 'https://red-cherry-cb88.unholyshit.workers.dev/repos/seanmorris/nynex95/contents';
		// this.args.url  = args.url  || 'https://api.github.com/repos/seanmorris/nynex95/contents';
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

		if(this.args.files)
		{
			this.args.icon = '/w95/5-16-4bit.png';
			this.args.expanded = true;
			return;
		}

		fetch(this.args.url).then(r => r.json()).then(files => {

			if(!Array.isArray(files))
			{
				this.args.browser.window.args.content  = '';
				this.args.browser.window.args.filename = '';
				this.args.browser.window.args.content  = 'loading...';

				fetch(files.download_url).then(r => r.text()).then(body => {

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

			this.args.files = files.map(file => {
				const browser = this.args.browser;

				const url  = file.url;
				const name = file.name;
				const icon = file.type === 'dir'
					? '/w95/4-16-4bit.png'
					: '/w95/60-16-4bit.png';

				return new Folder({browser, url, name, icon});

			});

			this.args.icon = '/w95/5-16-4bit.png';
			this.args.expanded = true;
		});
	}
}
