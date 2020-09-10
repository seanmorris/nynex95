import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';
import { Path } from '../../Path';

import { Bindable } from 'curvature/base/Bindable';

import { Console as Terminal } from 'subspace-console/Console';

export class Console extends Task
{
	title    = 'Console';
	icon     = '/apps/console-16-24bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);
		this.window.args.console = null;
		return Bindable.make(this);
	}

	attached()
	{
		const terminal = new Terminal({
			path:Path, scroller: this.window.tags.term.element
		});

		this.window.args.console = terminal;

		terminal.args.output.push('## Welcome to the Nynex Terminal');
	}
}
