import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class TaskManager extends Task
{
	title     = 'Task Manager';
	icon      = '/w95/61-16-4bit.png';
	template  = require('./main.tmp');
	willFocus = null;

	constructor(taskList)
	{
		super(taskList);

		const args = this.window.args;

		args.cycler = {};

		args.focusAttrs = {};

		args['data-thing'] = '!!!';

		args.bindTo('poppedOut', v => {

			const focus = args.focusAttrs;

			// if(v)
			// {
			// 	focus.disabled = 'disabled';
			// 	args['data-thing'] = '';

			// }
			// else if(focus)
			// {
			// 	args['data-thing'] = '!!';
			// 	delete focus.disabled;
			// }

			// args.focusAttrs = focus;
		});

		this.window.toJSON = (i) => {
			return JSON.stringify(i);
		};

		this.window.recycle = () => {

		}

		this.window.click = () => {
			this.x = this.x || 0;

			const l = [1,2,null,4,5,undefined,7,8];

			if(++this.x >= l.length)
			{
				this.x = 0;
			}

			args.cycler.at = l[this.x];

			// console.log(this.x, l[this.x], args.cycler);
		}
	}

	attached(event)
	{
		console.log(navigator.userActivation.isActive, navigator.userActivation.hasBeenActive);

		this.window.endTask = (event, task) => {

			const bindableThis = Bindable.make(task);

			if(task === bindableThis && this.window.outWindow)
			{
				const oldWindow = this.window.outWindow;

				this.window.popBackIn();

				oldWindow.close();
			}
			else
			{
				task.window.close();
			}
		}

		this.window.focusTask = (event, task) => {

			if(event.view !== window)
			{
				this.window.willFocus = task.window.name;
			}

			task.window.focus();
		}

		this.window.args.tasks = Home.instance().tasks.list;

		// this.window.args.menuBar  = new MenuBar(this.args, this.window);
	}
}
