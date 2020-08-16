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

		this.template = require('./window.tmp');

		this.args.wid = this.constructor.idInc++;
		this.args.titleBar = 'lol';
		this.args.titleBar = new TitleBar(this.args, this);
	}

	postRender()
	{
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
		const canceled = this.dispatchEvent(new CustomEvent(
			'minimizing', {detail:{ target:this }}
		));

		if(canceled)
		{
			return;
		}

		this.classes.minimized = true;
		this.classes.maximized = false;

		this.dispatchEvent(new CustomEvent(
			'minimized', {detail:{ target:this }}
		));

		this.pause(true);
	}

	restore()
	{
		const canceled = this.dispatchEvent(new CustomEvent(
			'restoring', {detail:{ target:this }}
		));

		if(canceled)
		{
			return;
		}

		this.classes.minimized = false;
		this.classes.maximized = false;

		this.dispatchEvent(new CustomEvent(
			'restored', {detail:{ target:this }}
		));

		this.pause(false);
	}

	maximize()
	{
		const canceled = this.dispatchEvent(new CustomEvent(
			'maximizing', {detail:{ target:this }}
		));

		if(canceled)
		{
			return;
		}

		this.classes.minimized = false;
		this.classes.maximized = true;

		this.dispatchEvent(new CustomEvent(
			'maximized', {detail:{ target:this }}
		));

		this.pause(false);
	}

	close()
	{
		const canceled = this.dispatchEvent(new CustomEvent(
			'closing', {detail:{ target:this }}
		));

		if(canceled)
		{
			return;
		}

		this.windows.remove(this);

		this.dispatchEvent(new CustomEvent(
			'closed', {detail:{ target:this }}
		));
	}

	focus()
	{
		const canceled = this.dispatchEvent(new CustomEvent(
			'focusing', {detail:{ target:this }}
		));

		if(canceled)
		{
			return;
		}

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

		this.dispatchEvent(new CustomEvent(
			'focused', {detail:{ target:this }}
		));
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

			if(this.classes.maximized)
			{
				this.classes.maximized = false;

				start.y = 0;
			}

			const mouse = { x: event.clientX, y: event.clientY };
			const moved = { x: mouse.x - click.x, y: mouse.y - click.y };

			this.pos.x = start.x + moved.x;
			this.pos.y = start.y + moved.y;
		}

		const options = {once: true};

		const drop = (event) => {

			if(this.pos.y < 0)
			{
				this.pos.y = 0;
			}

			if(this.pos.x < 0)
			{
				this.pos.x = 0;
			}

			document.removeEventListener('mousemove', moved);
			document.removeEventListener('touchmove', moved);

			document.removeEventListener('mouseup',  drop, options);
			document.removeEventListener('touchend', drop, options);

		};

		document.addEventListener('touchmove', moved);
		document.addEventListener('mousemove', moved);

		document.addEventListener('mouseup',  drop, options);
		document.addEventListener('touchend', drop, options);
	}
}

Base = Target.mix(Base);
Base = CssSwitch.mix(Base);
Base = ViewProcessor.mix(Base);

export class Window extends Base{};
