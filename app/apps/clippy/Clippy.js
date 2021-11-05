import { Task } from 'task/Task';
// import { Icon } from '../../icon/Icon';
// import { Home } from '../../home/Home';

// import { Bindable } from 'curvature/base/Bindable';

export class Clippy extends Task
{
	static helpText = 'Summon the devil.';

	title    = 'Clippy';
	icon     = '/w95/3-16-4bit.png';
	template = require('./main.tmp');
	// silent   = true

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.xFrame = 0;
		this.yFrame = 0;

		this.window.args.width  = '128px';
		this.window.args.height = '118px';

		this.window.maximize = () => {};
		this.window.classes.focused = false;

		this.window.ruleSet.add('.clippy', tag =>{

			const el = tag.element;

			this.window.onFrame(()=>{
				el.style.backgroundPosition = `${124 * this.xFrame}px ${ 93 * this.yFrame}px`;

				if(Math.random() > 0.45)
				{
					return;
				}

				if(Math.random() > 0.9)
				{
					this.xFrame -= 3;
				}

				if(Math.random() > 0.85)
				{
					this.yFrame -= 2;
				}

				Math.random() > 0.5
					? this.xFrame++
					: this.yFrame++;

				if(this.xFrame > 22)
				{
					this.xFrame = 0;
				}

				if(this.xFrame < 0)
				{
					this.xFrame = 22;
				}
			});
		});

		this.window.classes.transparent   = true;
		this.window.classes.pane          = false;
		this.window.classes['clippy-win'] = true;
	}
}
