import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class ClonesNBarrels extends Task
{
	static helpText = 'Play ClonesNBarrels!';

	title    = 'Clones n Barrels';
	icon     = '/sm/barrel-16-24bit.png';
	template = require('./main.tmp');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.classes.clones = true;

		this.window.args.src = 'https://clonesnbarrels.com/'
	}
}
