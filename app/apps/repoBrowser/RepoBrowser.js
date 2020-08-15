import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { Folder } from './Folder';
import { Json as JsonControl } from '../../control/Json';

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
		this.window.classes['repo-browser'] = true;

		const folder = new Folder({browser:this});

		this.window.args.files = this.window.args.files || [];
		this.window.args.files.push(folder);

		folder.expand();

		this.window.args.bindTo('filename', v => {

			const filetype = String(v).split('.').pop();

			if(filetype === 'json')
			{
				this.window.args.control = new JsonControl(this.window.args, this);
			}


			this.window.args.filetype = filetype;

		});
	}
}
