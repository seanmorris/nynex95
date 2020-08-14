import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { Bindable } from 'curvature/base/Bindable';

export class IconExplorer extends Task
{
	title    = 'Icon Explorer';
	icon     = '/w95/3-16-4bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.init = Date.now();

		return Bindable.make(this);
	}

	attached()
	{
		this.window.args.icons = Array(72).fill(1).map((v, k) => {

			const icon = new Icon({
				action: (event) => {

					this.window.args.preview = icon.args.src;
					this.window.args.content = icon.args.src;

					const large = new Icon(Object.assign({},icon.args));
					const small = new Icon(Object.assign({},icon.args));

					small.args.size = 16;

					this.window.args.large = large;
					this.window.args.small = small;

					this.window.args.smallSrc = small.args.src;
					this.window.args.largeSrc = large.args.src;

					this.window.args.icon = small.args.src;
				}
				, icon: 1+k
				, name: 1+k
			});

			return icon;

		});

		if(this.window.tags['small-icon'])
		{
			const smallIcon = this.window.tags['small-icon'].element;

			smallIcon.style.width          = '64px';
			smallIcon.style.height         = '64px';
			smallIcon.style.display        = 'flex';
			smallIcon.style.justifyContent = 'center';
		}

		if(this.window.tags['large-icon'])
		{
			const largeIcon = this.window.tags['large-icon'].element;

			largeIcon.style.width          = '64px';
			largeIcon.style.height         = '64px';
			largeIcon.style.display        = 'flex';
			largeIcon.style.justifyContent = 'center';
		}

		this.window.args.bindTo('age', v => {
			// this.args.title = `Icon Explorer - Window Age: ${v}s`
		});

		this.window.onFrame(()=>{
			const age = Date.now() - this.init;

			this.window.args.progr = ((age / 100) % 100).toFixed(2);
			this.window.args.window.args.age = (age / 1000).toFixed(1);
		});
	}
}
