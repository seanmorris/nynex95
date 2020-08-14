import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class Nynepad extends Task
{
	title    = 'Nynepad 95';
	icon     = '/w95/60-16-4bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.init = Date.now();

		return Bindable.make(this);
	}

	attached()
	{
		this.window.args.menuBar  = new MenuBar(this.args, this);
	}
}
