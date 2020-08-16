import { Bag  } from 'curvature/base/Bag';
import { View } from 'curvature/base/View';

import { Desktop  } from 'desktop/Desktop';
import { Window   } from 'window/Window';
import { TaskBar  } from 'task/TaskBar';
import { Task     } from 'task/Task';

import { IconExplorer } from 'apps/iconExplorer/IconExplorer';
import { TaskManager  } from 'apps/taskManager/TaskManager';
import { RepoBrowser  } from 'apps/repoBrowser/RepoBrowser';
import { Nynepad      } from 'apps/nynepad/Nynepad';
import { Clippy       } from 'apps/clippy/Clippy';

export class Home extends View
{
	static singleton = false;
	static path      = {
		'/apps/icon-explorer':  IconExplorer
		, '/apps/task-manager': TaskManager
		, '/apps/nynepad':      Nynepad
		, '/apps/repo-browser': RepoBrowser
		, '/apps/window':       Task
		, '/apps/clippy':       Clippy
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

		this.open = {x: 80, y: 50};

		this.args.desktop = new Desktop({}, this);

		this.windows = new Bag((i,s,a) => {

			if(a !== Bag.ITEM_ADDED)
			{
				return;
			}

			i.windows = this.windows;

			i.pos.x = this.open.x;
			i.pos.y = this.open.y;

			this.open.x += 50;
			this.open.y += 80;

			this.open.x %= window.innerWidth;
			this.open.y %= (window.innerHeight - 128);
		});

		this.tasks   = new Bag();

		// this.windows.type = Window;
		// this.tasks.type   = Task;

		const taskBar = new TaskBar({tasks: this.tasks.list});

		this.args.windows  = this.windows.list;
		this.args.tasks    = this.tasks.list;

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
	}
}
