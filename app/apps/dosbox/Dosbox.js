import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

require("js-dos");

export class Dosbox extends Task
{
	title    = 'SM-DOS';
	icon     = '/apps/dos-16-24bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.window.classes.clones = true;
	}

	attached()
	{
		const canvas = this.window.findTag('canvas');

		if(!canvas)
		{
			console.error('Could not find <canvas>.');
		}

		console.log('Nice!');

		Dos(canvas).ready((fs, main) => {
			console.log('Nice!');
		});
		// Dos(canvas).ready((fs, main) => {
		// 	main(["arg1", "arg2", ...])
		// });
	}
}
