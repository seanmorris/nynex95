import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { Folder } from './Folder';

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
	}
}
