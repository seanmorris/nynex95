import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';
import { Path } from '../../Path';

import { Bindable } from 'curvature/base/Bindable';

import { Console as Terminal } from 'subspace-console/Console';

export class Grid extends Task
{
	title    = 'Icon Explorer';
	icon     = '/w95/3-16-4bit.png';
	// template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		return Bindable.make(this);
	}
}