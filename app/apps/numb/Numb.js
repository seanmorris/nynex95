import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class Numb extends Task
{
	title    = 'numb-linkin park.mp3.exe';
	icon     = '/apps/numb-16-8bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.window.classes.clones = true;

		this.window.args.src = 'https://clonesnbarrels.com/'
	}

	attached()
	{
		const onMessage = (event) => {
			console.log(event);
		};

		const frame = this.findTags('iframe');

		frame.addEventListener('message', event);

		this.onRemove(frame.removeEventListener('message', event));
	}
}
