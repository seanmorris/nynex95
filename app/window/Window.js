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
	static idInc = 0;

	constructor(args = {})
	{
		super(args);

		this.args.classes = ['pane', 'resize'];
		this.args.preview = '/w95/1-16-4bit.png';

		this.pos = Bindable.make({x: 160, y: 100, z: 0});

		this.args.icon  = args.icon       || '/w95/3-16-4bit.png';
		this.args.title = this.args.title || 'Application Window';
		this.args.progr = 0;

		// this.args.content = 'Double-click an icon below.';

		// this.args.smallSrc = this.args.largeSrc = '--';

		this.template = require('./window.tmp');

		this.args.wid = this.constructor.idInc++;
	}

	postRender()
	{
		this.args.titleBar = new TitleBar(this.args, this);

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
		this.classes.resize = true;
		this.classes.pane   = true;

		this.dispatchEvent(new CustomEvent(
			'attached', {detail:{ target:this }}
		));
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
		this.windows.remove(this);

		this.dispatchEvent(new CustomEvent(
			'closed', {detail:{ target:this }}
		));
	}

	focus()
	{
		const prevZ = this.pos.z;

		const windows = this.windows.items();


		for(const i in windows)
		{
			if(windows[i].pos.z > prevZ)
			{
				windows[i].pos.z--;
				windows[i].classes.focused = false;
			}
		}

		this.pos.z = windows.length;
		this.classes.focused = true;
	}

	doubleClickTitle(event)
	{
		if(this.classes.maximized || this.classes.minimized)
		{
			this.restore();
			return;
		}

		this.maximize();
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

			if(this.pos.y < 0)
			{
				this.pos.y = 0;
			}

			if(this.pos.x < 0)
			{
				this.pos.x = 0;
			}

			document.removeEventListener('mousemove', moved);

		}, {once: true});
	}
}

Base = Target.mix(Base);
Base = CssSwitch.mix(Base);
Base = ViewProcessor.mix(Base);

export class Window extends Base{};
