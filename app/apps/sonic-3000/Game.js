import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class Game extends Task
{
	title    = 'Sonic 3000';
	icon     = '/';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.window.classes.clones = true;

		this.window.args.src = 'https://pixel-physics.seanmorr.is/'
	}
}
