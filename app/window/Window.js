import { View     } from 'curvature/base/View';
import { Bindable } from 'curvature/base/Bindable';
import { MenuBar  } from './MenuBar';
import { TitleBar } from './TitleBar';

import { Target        } from '../mixin/Target';
import { CssSwitch     } from '../mixin/CssSwitch';
import { ViewProcessor } from '../mixin/ViewProcessor';

import { Icon } from '../icon/Icon';

let Base = class extends View
{
	constructor(args = {})
	{
		super(args);

		this.init = Date.now();

		this.args.classes = ['pane', 'resize'];

		this.pos = Bindable.make({x: 160, y: 100, z: 0});

		this.args.icon  = args.icon || '/w95/3-16-4bit.png';
		this.args.title = Date.now() - this.init;
		this.args.progr = 0;

		this.template = require('./window.tmp');
		this.args.icons = Array(72).fill(1).map((v, k) => {

			return new Icon({icon: 1+k, name: 1+k})

		});
	}

	postRender()
	{
		this.args.titleBar = new TitleBar(this.args, this);
		this.args.menuBar  = new MenuBar(this.args, this);

		const element = this.tags.window.element;

		this.pos.bindTo('x', (v,k) => {
			element.style.left = `${v}px`;
			this.args.x = v;
		});

		this.pos.bindTo('y', (v,k) => {
			element.style.top = `${v}px`;
			this.args.y = v;
		});

		this.pos.bindTo('z', (v,k) => {
			element.style.zIndex = v;
			this.args.z = v;
		});
	}

	attached(parent)
	{
		this.args.bindTo('title', v => this.args.content = v)

		this.onFrame(()=>{
			const age = Date.now() - this.init;

			this.args.progr = ((age / 100) % 100).toFixed(2);

			this.args.title = `age: ${(age / 1000).toFixed(1)}s`;
		});

		this.dispatchEvent(new CustomEvent(
			'attached', {detail:{ parent, target:this }})
		);
	}

	menuFocus()
	{
		this.classes['menu-open'] = true;
	}

	menuBlur()
	{
		this.classes['menu-open'] = false;
	}

	minimize()
	{
		this.classes.minimized = true;
		this.classes.maximized = false;

		this.dispatchEvent(new CustomEvent(
			'minimized', {detail:{ target:this }}
		));
	}

	restore()
	{
		this.classes.minimized = false;
		this.classes.maximized = false;

		this.dispatchEvent(new CustomEvent(
			'restored', {detail:{ target:this }}
		));
	}

	maximize()
	{
		this.classes.minimized = false;
		this.classes.maximized = true;

		this.dispatchEvent(new CustomEvent(
			'maximized', {detail:{ target:this }}
		));
	}

	close()
	{
		// this.remove();
		this.windows.remove(this);

		this.dispatchEvent(new CustomEvent(
			'closed', {detail:{ target:this }}
		));
	}

	focus()
	{
		console.log(this.windows.items());

		const windows = this.windows.items().sort((a,b) => {
			Number(a.pos.z) - Number(b.pos.z);
		});

		let passed = false;
		let ii = 0;

		for(const i in windows)
		{
			if(windows[i].pos.z >= windows.length)
			{
				windows[i].pos.z = windows.length - 1;

				continue;
			}

			windows[i].pos.z = ii++;
		}

		this.pos.z = windows.length;
	}

	blur()
	{
		// this.pos.z = 0;
	}

	grabTitleBar(event)
	{
		const start = { x: this.pos.x, y: this.pos.y};
		const click = { x: event.clientX, y: event.clientY };

		const moved = (event) => {

			const mouse = { x: event.clientX, y: event.clientY };
			const moved = { x: mouse.x - click.x, y: mouse.y - click.y };

			this.pos.x = start.x + moved.x;
			this.pos.y = start.y + moved.y;
		}

		document.addEventListener('mousemove', moved);

		document.addEventListener('mouseup', (event) => {

			document.removeEventListener('mousemove', moved);;

		}, {once: true});
	}
}

Base = Target.mix(Base);
Base = CssSwitch.mix(Base);
Base = ViewProcessor.mix(Base);

export class Window extends Base{};
