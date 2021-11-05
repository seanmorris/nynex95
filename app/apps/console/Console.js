import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';
import { Path } from '../../Path';

import { Bindable } from 'curvature/base/Bindable';

import { Console as Terminal } from 'subspace-console/Console';

export class Console extends Task
{
	static helpText = 'Open a terminal.';

	title    = 'Console';
	icon     = '/apps/console-16-24bit.png';
	template = require('./main.tmp');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);
		this.window.args.console = null;
		return Bindable.make(this);
	}

	attached()
	{
		const terminal = new Terminal({
			scroller:   this.window.tags.term.element
			, external: [this.list, this.cmd, this.path]
			, path:     Path
		});

		this.window.args.console = terminal;

		terminal.write('\u001b[38m\u001b[41m ## Welcome to the Nynex Terminal ## ');
		terminal.write('\u001b[2m\u001b[47m  \u001b[40m  \u001b[41m  \u001b[42m  \u001b[43m  \u001b[44m  \u001b[45m  \u001b[46m  ');
		terminal.write('\u001b[47m  \u001b[40m  \u001b[41m  \u001b[42m  \u001b[43m  \u001b[44m  \u001b[45m  \u001b[46m  ');
		terminal.write('\u001b[1m\u001b[47m  \u001b[40m  \u001b[41m  \u001b[42m  \u001b[43m  \u001b[44m  \u001b[45m  \u001b[46m  ');

		terminal.interpret('?');
	}
}
