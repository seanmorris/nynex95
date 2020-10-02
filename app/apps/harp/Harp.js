import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class Harp extends Task
{
	title    = 'Jasmine\'s Harp';
	icon     = '/w95/1-16-4bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.window.classes.clones = true;

		this.window.args.src = 'https://jasmines-harp.seanmorr.is/'
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
