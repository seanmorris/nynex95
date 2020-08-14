import { View } from 'curvature/base/View';

export class TaskBar extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./taskBar.tmp');

		this.args.tasks.bindTo((v,k,t) => {

			this.args.taskCount = Object.values(t).length;

		}, {frame:1});
	}

	attached()
	{
		this.onFrame(()=>{
			const date = new Date;

			this.args.hh = String(date.getHours()).padStart(2,0);
			this.args.mm = String(date.getMinutes()).padStart(2,0);
			this.args.ss = String(date.getSeconds()).padStart(2,0);
		});
	}

	activate(event, task)
	{
		if(task.window)
		{
			task.window.focus();

			if(task.window.classes.minimized)
			{
				task.window.restore();
			}

		}
	}

	doubleTap(event, task)
	{
		if(task.window.classes.minimized || task.window.classes.maximized)
		{
			task.window.restore();
			return;
		}

		task.window.maximize();
	}
}
