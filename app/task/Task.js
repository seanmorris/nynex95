import { Home     } from '../home/Home';
import { Sealed   } from '../mixin/Sealed';
import { Window   } from '../window/Window';
import { Target   } from '../mixin/Target';
import { Bindable } from 'curvature/base/Bindable';

let taskId = 0;
const Accept = Symbol('accept');
const Reject = Symbol('reject');

export class Task
{
	title   = 'Generic Task';
	icon    = '/w95/3-16-4bit.png';
	silent  = false;
	failure = false;

	thread = new Promise((accept, reject) => {
		this[Accept] = accept;
		this[Reject] = reject;
	});

	constructor(taskList, taskCmd = '', taskPath = [])
	{
		// super();

		this.id = taskId++;

		this.cmd  = taskCmd;
		this.path = taskPath;

		// console.log('Thread initialized.');

		// this.thread.finally(() => console.log('Thread closed.'));

		this.window = new Window(this);

		// this.addEventListener('start', (event) => {
		// });

		if(!this.silent)
		{
			this.window.addEventListener('closed', (event) => {

				this.signal(event);

				taskList.remove(this);
				taskList.remove(Bindable.make(this));

			});

			this.window.addEventListener('attached', (event) => {

				this.signal(event);

				this.attached();
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

		return this;
	}

	print(input)
	{
		console.log(error);
	}

	error(input)
	{
		console.error(error);
	}

	signal(event)
	{
		switch(event.type)
		{
			case 'closed':
				this.failure ? this[Reject]() : this[Accept]();

				break;

			case 'kill':
				this[Reject]();

				break;
		}
	}

	execute()
	{
		return new Promise(() => {

			// console.log('Thread continued.');

		});
	}

	attached(){}
}

// export class Task extends Target.mix(BaseTask){};
