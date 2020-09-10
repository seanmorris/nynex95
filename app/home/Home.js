import { Bag  } from 'curvature/base/Bag';
import { View } from 'curvature/base/View';

import { Desktop  } from 'desktop/Desktop';
import { Window   } from 'window/Window';
import { TaskBar  } from 'task/TaskBar';
import { Task     } from 'task/Task';
import { Path     } from '../Path';

export class Home extends View
{
	static singleton = false;

	static path = Path;

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

		this.open = {x: 80, y: 50};

		this.args.desktop = new Desktop({}, this);

		this.tasks   = new Bag();
		this.tray    = new Bag();
		this.windows = new Bag((i,s,a) => {

			if(a !== Bag.ITEM_ADDED)
			{
				return;
			}

			i.windows = this.windows;

			i.pos.x = this.open.x;
			i.pos.y = this.open.y;

			this.open.x += 57;
			this.open.y += 93;

			this.open.x %= Math.floor(window.innerWidth / 2);
			this.open.y %= Math.floor(window.innerHeight / 2);

			console.log(this.open.x, this.open.y);
		});


		// this.windows.type = Window;
		// this.tasks.type   = Task;

		const taskBar = new TaskBar({
			tasks:  this.tasks.list
			, tray: this.tray.list
		});

		this.args.windows  = this.windows.list;
		// this.args.tasks    = this.tasks.list;
		// this.args.tray     = this.tray.list;

		this.args.taskBar  = taskBar;
	}

	run(taskName)
	{
		const taskType = Home.path[taskName] || false;

		if(!taskType)
		{
			alert(`${taskName}: Bad command or filename.`);
			return false;
		}

		const task = new taskType(this.tasks);

		this.tasks.add(task);

		this.onTimeout(250, () => {
			task.signal(new CustomEvent('start'))
		});
	}
}
