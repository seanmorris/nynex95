import { View } from 'curvature/base/View';
import { Menu } from '../menu/Menu';

export class TaskBar extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./taskBar.tmp');

		this.args.tasks.bindTo((v,k,t) => {
			this.args.taskCount = Object.values(t).length;
		}, {frame:1});

		this.args.programMenu = new Menu({items:[
			{ icon:'/w95/20-16-4bit.png', name:'Accessories', menu:[
				{ icon: '/w95/60-16-4bit.png', name: 'Nynepad', path: 'nynepad' },
				{ icon: '/w98/paint-16-8bit.png', name: 'Image Viewer', path: 'image-viewer' }
			] },

			{ icon:'/w95/21-16-4bit.png', name:'Office', menu:[] },

			{ icon:'/w95/21-16-4bit.png', name:'Desktop', folder: "~/desktop", menu:[] },

			{ icon:'/w95/21-16-4bit.png', name:'Games', menu:[
				{ icon: '/apps/console-16-24bit.png', name: 'Sonic the Hedgehog 3000', path: 'sonic3000' },
			] },

			{ icon:'/w95/21-16-4bit.png', name:'System', menu:[
				{ icon: '/apps/console-16-24bit.png', name: 'Terminal', path: 'terminal' },
				{ icon: '/w98/computer_taskmgr-16-4bit.png', name: 'Task Manager', path: 'task-manager' },
			] },

		]});
	}

	onAttach()
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
			if(task.window.outWindow)
			{
				task.window.focus(event);

				return;
			}

			if(task.window.classes.minimized)
			{
				task.window.restore(event);
			}

			task.focus(event);
		}
	}

	doubleTap(event, task)
	{
		if(!task.window)
		{
			return;
		}

		if(task.window.outWindow)
		{
			task.window.willFocus = task.window.name;

			task.window.focus();

			return;
		}

		if(task.window.classes.minimized || task.window.classes.maximized)
		{
			task.window.restore();
			return;
		}

		task.window.maximize();
	}

	attachTask(event, task)
	{
		task.taskButton = event.target;
	}
}
