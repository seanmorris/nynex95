import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { Folder } from './Folder';
import { Html as HtmlControl } from '../../control/Html';
import { Json as JsonControl } from '../../control/Json';
import { Image as ImageControl } from '../../control/Image';
import { Plaintext as PlaintextControl } from '../../control/Plaintext';

export class RepoBrowser extends Task
{
	title    = 'Repo Browser';
	icon     = '/w95/73-16-4bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);
	}

	attached()
	{
		this.window.args.filetype = '';
		this.window.args.chars    = '';

		this.window.classes['repo-browser'] = true;

		const folder = new Folder({browser:this});

		this.window.args.files = this.window.args.files || [];
		this.window.args.files.push(folder);

		folder.expand();

		this.window.args.bindTo('filename', v => {

			const filetype = (v||'').split('.').pop();

			if(this.window.args.control)
			{
				this.window.args.control.remove();
			}

			this.window.args.filetype = filetype || '';

			this.window.args.chars = 0;

			switch(filetype)
			{

				case 'md':
					this.window.args.control = new HtmlControl(
						{ srcdoc: 'loading...' }
						, this
					);

					fetch(
						this.window.args.meta.download_url
						, {headers: {Accept: 'application/vnd.github.v3.html'}}
					).then(r=>r.text()).then(r=>{

						this.window.args.control.args.srcdoc = r;

					});

					break;

				case 'ico':
				case 'gif':
				case 'png':
				case 'jpg':
				case 'jpeg':
				case 'webp':
					this.window.args.control = new ImageControl(
						{src:this.window.args.meta.download_url}
						, this
					);
					break;

				case 'json':
					this.window.args.control = new JsonControl(
						{
							expanded: 'expanded'
							, tree: JSON.parse(this.window.args.content)
						}
						, this
					);
					break;

				default:
					this.window.args.control = new PlaintextControl(
						{content: this.window.args.content}
						, this
					);
					break;
			}

			this.window.args.chars = (this.window.args.content||'').length;
		});
	}
}
