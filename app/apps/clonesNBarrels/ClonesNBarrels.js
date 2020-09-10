import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class ClonesNBarrels extends Task
{
	title    = 'Clones n Barrels';
	icon     = '/sm/barrel-16-24bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.window.classes.clones = true;

		this.window.args.src = 'https://clonesnbarrels.com/'
	}
}
