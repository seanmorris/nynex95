import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class TaskManager extends Task
{
	title    = 'Task Manager';
	icon     = '/w95/61-16-4bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);
	}

	attached()
	{
		this.window.endTask = (event, task) => {
			task.window.close();
		};

		this.window.focusTask = (event, task) => {


			setTimeout(1000, ()=> {

				console.log(task.window);
				task.window.focus();

			});
		};

		this.window.args.tasks = [];

		this.window.args.tasks = Home.instance().tasks.list;

		this.window.args.menuBar  = new MenuBar(this.args, this.window);
	}
}
