import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class TaskManager extends Task
{
	static helpText = 'View or kill running tasks.';

	title     = 'Task Manager';
	icon      = '/w98/computer_taskmgr-16-4bit.png';
	template  = require('./main.tmp');
	willFocus = null;

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		const wArgs = this.window.args;

		wArgs.cycler = {};

		wArgs.tasks = args.tasks || [];

		wArgs.focusAttrs = {};

		wArgs['data-thing'] = '!!!';

		wArgs.cores = navigator.hardwareConcurrency;

		wArgs.bindTo('poppedOut', v => {

			const focus = wArgs.focusAttrs;

			// if(v)
			// {
			// 	focus.disabled = 'disabled';
			// 	wArgs['data-thing'] = '';

			// }
			// else if(focus)
			// {
			// 	wArgs['data-thing'] = '!!';
			// 	delete focus.disabled;
			// }

			// wArgs.focusAttrs = focus;
		});

		this.samples = [];

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

			wArgs.cycler.at = l[this.x];

			// console.log(this.x, l[this.x], wArgs.cycler);
		}

		this.pause = false;

		this.window.onFrame(() => {

			if(this.window.classes.minimized)
			{
				this.pause = true;

				return;
			}

			if(this.pause)
			{
				if(!this.pauseTimeout)
				{
					this.pauseTimeout = this.window.onTimeout(500, () => {
						this.pauseTimeout = this.pause = false;
					});
				}

				return;
			}

			this.window.args.tasksCount = this.window.args.tasks.filter(x=>x).length;

			const memory = window.performance.memory;

			this.window.args.jsHeapSizeLimit = memory.jsHeapSizeLimit;
			this.window.args.totalJSHeapSize = memory.totalJSHeapSize;
			this.window.args.usedJSHeapSize  = memory.usedJSHeapSize;

			const used  = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
			const total = memory.totalJSHeapSize / memory.jsHeapSizeLimit;

			this.window.args.heapUsedPercent = 100 * used;
			this.window.args.heapTotalPercent = 100 * total;

			this.window.args.usedMb = (memory.usedJSHeapSize / (1024**2)).toFixed(2);
			this.window.args.totalMb = (memory.totalJSHeapSize / (1024**2)).toFixed(2);

			if(this.window.tags.graph && this.window.tags.graph.width)
			{
				const graph = this.window.tags.graph;

				this.samples.push({used, total});

				while(this.samples.length > graph.width)
				{
					this.samples.shift();
				}

				if(graph.width !== graph.clientWidth)
				{
					graph.width  = graph.clientWidth;
				}

				if(graph.height !== graph.clientHeight)
				{
					graph.height  = graph.clientHeight;
				}

				const context = graph.getContext('2d');

				context.clearRect(0, 0, graph.width, graph.height);

				const image = context.getImageData(0, 0, graph.width, graph.height);

				const w = image.width;
				const h = image.height;

				for(let i = 0; i < image.width; i++)
				{
					if(!this.samples[i])
					{
						break;
					}

					const sample = this.samples[i];

					const u = 1 - sample.used;
					const t = 1 - sample.total;

					const usedOffset = (4 * w * (Math.floor(h * u) - 1)) + (4 * i);
					const totalOffset = (4 * w * (Math.floor(h * t) - 1)) + (4 * i);

					image.data[totalOffset + 0] = 0;
					image.data[totalOffset + 1] = 128;
					image.data[totalOffset + 2] = 0;
					image.data[totalOffset + 3] = 255;

					image.data[usedOffset + 0] = 0;
					image.data[usedOffset + 1] = 255;
					image.data[usedOffset + 2] = 0;
					image.data[usedOffset + 3] = 255;
				}

				context.putImageData(image, 0, 0);
			}
		});
	}

	attached(event)
	{
		this.window.endTask = (event, task) => {

			const bindableThis = Bindable.make(this);

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
