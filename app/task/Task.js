import { Home   } from '../home/Home';
import { Sealed } from '../mixin/Sealed';
import { Window } from '../window/Window';

let win = undefined;

export class Task
{
	title  = 'Application';
	icon   = '/w95/3-16-4bit.png';
	silent = false;
	list   = undefined;

	constructor(taskList)
	{
		if(!this.silent)
		{
			const home = Home.instance();
			const win  = new Window(this);

			win.addEventListener('closed', () => taskList.remove(this));

			home.windows.add(win);

			win.focus();
		}
	}
}
