import { Bag  } from 'curvature/base/Bag';
import { View } from 'curvature/base/View';

import { Desktop  } from 'desktop/Desktop';
import { Window   } from 'window/Window';
import { Task     } from 'task/Task';

export class Home extends View
{
	static singleton = false;
	static path      = {
		'/apps/icon-explorer': Task
	};

	static instance()
	{
		if(this.singleton)
		{
			return this.singleton;
		}

		return this.singleton = new this;
	}

	constructor(args)
	{
		super(args);

		this.template = require('./home.tmp');

		this.args.desktop = new Desktop({}, this);

		this.windows = new Bag((i,s,a) => {

			if(a !== Bag.ITEM_ADDED)
			{
				return;
			}

			i.windows = this.windows;

			i.focus();

		});

		this.tasks   = new Bag();

		// this.windows.type = Window;
		// this.tasks.type   = Task;

		this.args.windows = this.windows.list;
		this.args.tasks   = this.tasks.list;
	}

	run(taskName)
	{
		const taskType = Home.path[taskName] || false;

		if(!taskType)
		{
			return false;
		}

		const task = new taskType(this.tasks);

		this.tasks.add(task);
	}
}
