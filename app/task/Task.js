import { Home     } from '../home/Home';
import { Sealed   } from '../mixin/Sealed';
import { Window   } from '../window/Window';
import { Target   } from '../mixin/Target';
import { Bindable } from 'curvature/base/Bindable';

let taskId = 0;
const Accept = Symbol('accept');
const Reject = Symbol('reject');

import { Task as BaseTask } from 'subspace-console/Task';

export class Task extends BaseTask
{
	title   = 'Generic Task';
	icon    = '/w95/3-16-4bit.png';
	outPrompt  = '> ';
	prompt  = '>>';
	silent  = false;
	failure = false;

	thread = new Promise((accept, reject) => {
		this[Accept] = accept;
		this[Reject] = reject;
	});

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term);

		this.id = taskId++;

		this.cmd  = taskCmd;
		this.path = taskPath;
		this.list = taskList;

		this.list.add(Bindable.make(this));

		this.thread.finally(() => {
			taskList.remove(Bindable.make(this));
			taskList.remove(this);
			this.window.close()
		});

		this.window = new Window(this);

		this.subWindows = new Set;

		if(this.window)
		{
			// console.trace(taskList);
			this.window.addEventListener('closed', event => {
				this.signal(event);
			});

			this.window.addEventListener('attached', event => {
				this.signal(event);
				this.attached();
			});

			this.window.addEventListener('detached', event => {
				this.signal(event);
				this.detached();
			});

			Home.instance().windows.add(this.window);

			this.window.focus();
		}

		let retVal = this.execute();

		if(!(retVal instanceof Promise))
		{
			retVal = Promise.resolve(retVal);
		}

		retVal.then(r => this[Accept](r)).catch(e => this[Reject](e));

		return Bindable.make(this);
	}

	write(line)
	{
		if(line[0] === ':')
		{
			line = line.substr(1);

			if(line[0] !== ':')
			{
				if(line[0] === '?')
				{
					this.print(Object.keys(this.commands).map(k => `:${k}`).join(', '));
				}
				else if(this.commands[ line[0] ])
				{
					this.commands[ line[0] ]();
				}
				else
				{
					this.printErr(`:${line[0]} is not a command.`);
				}

				return;
			}
		}

		console.log(line);

		this.document += this.document
			? ("\n" + line)
			: line;

		return super.write(line);
	}

	error(input)
	{
		console.error(input);
	}

	signal(event)
	{
		const type = typeof event === 'object'
			? event.type
			: event;

		switch(type)
		{
			case 'closed':
				this.failure
					? this[Reject](this.failure)
					: this[Accept]();

				break;

			case 'kill':
				// this.quit();
				this[Reject]('Received signal: KILL');

				break;
		}
	}

	execute()
	{
		return new Promise(() => {

			// console.log('Thread continued.');

		});
	}

	openSubWindow(args)
	{
		const subWindow = this.window.subWindow(args);

		subWindow.addEventListener(
			'closed'
			, event => this.subWindows.delete(subWindow)
			, {once:true}
		);

		this.subWindows.add(subWindow);

		Home.instance().windows.add(subWindow);

		return subWindow;
	}

	focus(...argList)
	{
		[...this.subWindows].map(subWindow => {
			subWindow.classes.minimized = false;
		});

		this.window.focus(...argList);
	}

	grabTitleBar(...argList)
	{
		this.window.grabTitleBar(...argList);
	}

	menuFocus(...argList)
	{
		this.window.menuFocus(...argList);
	}

	menuBlur(...argList)
	{
		this.window.menuBlur(...argList);
	}

	minimize(...argList)
	{
		[...this.subWindows].map(subWindow => {
			if(!subWindow.outWindow)
			{
				subWindow.minimize();
			}
		});

		this.window.minimize(...argList);
	}

	maximize(...argList)
	{
		this.window.maximize(...argList);
	}

	restore(...argList)
	{
		[...this.subWindows].map(subWindow => {
			subWindow.classes.minimized = false;
		});

		this.window.restore(...argList);
	}

	close(...argList)
	{
		[...this.subWindows].map(subWindow => {
			subWindow.close();
		});

		this.window.close(...argList);
	}

	doubleClickTitle(...argList)
	{
		this.window.doubleClickTitle(...argList);
	}

	horizontalResizeGrabbed(...argList)
	{
		this.window.horizontalResizeGrabbed(...argList);
	}

	verticalResizeGrabbed(...argList)
	{
		this.window.verticalResizeGrabbed(...argList);
	}

	attached(){}
}

// export class Task extends Target.mix(BaseTask){};
