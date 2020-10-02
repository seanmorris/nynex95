import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class Letsvue extends Task
{
	title    = 'Letsvue';
	icon     = '/apps/letsvue-32-24bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.window.classes.clones = true;

		this.window.args.src = 'https://letsvue.com/post/'
		this.window.args.width  = `440px`;
		this.window.args.height = `800px`;
		// this.window.args.menuBar  = new MenuBar(this.args, this.window);
	}

	attached()
	{

		const onMessage = (event) => {
			console.log(event);
		};

		const frame = this.window.findTag('iframe');

		frame.addEventListener('message', event);

		this.window.onRemove(()=>frame.removeEventListener('message', event));
	}
}
