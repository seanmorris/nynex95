import { Home     } from '../home/Home';
import { Sealed   } from '../mixin/Sealed';
import { Window   } from '../window/Window';
import { Bindable } from 'curvature/base/Bindable';

let win = undefined;

export class Task
{
	title  = '';
	icon   = '/w95/3-16-4bit.png';
	silent = false;

	constructor(taskList)
	{
		if(!this.silent)
		{
			const home  = Home.instance();
			this.window = new Window(this);

			this.window.addEventListener('closed',   (event) => taskList.remove(this));
			this.window.addEventListener('attached', (event) => this.attached());

			home.windows.add(this.window);

			this.window.focus();
		}

		return this;
	}

	attached()
	{
	}
}
