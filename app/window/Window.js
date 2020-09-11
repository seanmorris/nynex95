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

		this.args.width   = '690px';
		this.args.height  = '520px';

		this.pos = Bindable.make({x: 160, y: 100, z: 0});

		this.args.icon  = args.icon       || '/w95/3-16-4bit.png';
		this.args.title = this.args.title || 'Application Window';
		this.args.progr = 0;

		this.template = require('./window.tmp');

		this.args.wid = this.constructor.idInc++;

		this.args.titleBar     = new TitleBar(this.args, this);
		this.args.hideTitleBar = false;

		this.args.poppedOut = false;

		this.outWindow = false;
		this.wasMaximized = false;

		this.args.bindTo('title', v => {

			if(this.outWindow)
			{
				this.outWindow.document.title = v;
			}

		});
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

	popout()
	{
		const main = this.tags.window.element;
		const rect = main.getBoundingClientRect();
		const orig = main.parentNode;

		const trimSize = {
			x: window.outerWidth - window.innerWidth
			, y: window.outerHeight - window.innerHeight
		};

		const features = `screenX=${Math.floor(rect.x) + trimSize.x + window.screenX}`
			+ `,screenY=${Math.floor(rect.y) + trimSize.y + window.screenY}`
			+ `,width=${Math.floor(rect.width)}`
			+ `,height=${Math.floor(rect.height)}`;

		if(!(this.outWindow = window.open('', this._id, features)))
		{
			return;
		}

		this.args.poppedOut = true;

		this.outWindow.document.title = this.args.title;

		const mainUnload = () => {
			this.outWindow.close();
		};

		window.addEventListener('beforeunload', mainUnload);

		this.outWindow.addEventListener('beforeunload', () => {
			window.removeEventListener('beforeunload', mainUnload);
			this.outWindow = false;
			this.args.hideTitleBar = false;
			this.classes.maximized = this.wasMaximized;
			this.restore();
			this.render(orig);
			this.args.poppedOut = false;
		});

		const base = this.outWindow.document.createElement('base');

		base.setAttribute('href', origin);

		this.outWindow.document.head.append(base);

		const newDoc = this.outWindow.document;

		for(const sheet of document.styleSheets)
		{
			const newSheet = sheet.ownerNode.cloneNode(true);

			if(sheet.href)
			{
				newSheet.setAttribute('href', sheet.href);
			}

			newDoc.head.append(newSheet);
		}

		this.wasMaximized = this.classes.maximized;

		this.args.hideTitleBar = true;
		this.render(this.outWindow.document.body);
		this.classes.maximized = true;

		this.outWindow.document.body.classList.add('sub-window');
	}

	menuFocus()
	{
		console.log(this.tags.window.element.isConnected);

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

		if(this.outWindow)
		{
			this.outWindow.close();
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

		if(this.outWindow)
		{
			this.outWindow.focus();
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

		if(this.classes['popping'])
		{
			return;
		}

		this.classes['popping'] = true;

		this.onTimeout(450, () => {
			this.classes['popping'] = false;
			this.popout();
		});
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

	horizontalResizeGrabbed(event)
	{
		const start = event.clientY;
		let before  = event.target.previousSibling;
		let after   = event.target.nextSibling;
		let parent  = event.target.parentNode;

		[...parent.childNodes].map(child=>{

			if(child.nodeType !== Node.ELEMENT_NODE)
			{
				return;
			}

			if(child.matches('[data-horizontal-resize]'))
			{
				return;
			}

			child.style.maxHeight = `${child.clientHeight}px`;

			console.log(child);

		});

		//

		while(before.nodeType !== Node.ELEMENT_NODE && before.previousSibling)
		{
			before = before.previousSibling;
		}

		while(after.nodeType !== Node.ELEMENT_NODE && after.nextSibling)
		{
			after = after.nextSibling;
		}

		const beforeHeight = before.clientHeight;
		const afterHeight  = after.clientHeight;

		// before.style.height = `${beforeHeight}px`;
		// after.style.height  = `${afterHeight}px`;

		console.log(beforeHeight);

		const onMove = (event) => {
			const delta = start - event.clientY;

			if(beforeHeight - delta < 0)
			{
				return;
			}

			if(afterHeight + delta < 0)
			{
				return;
			}

			console.log(start, delta, beforeHeight);

			before.style.maxHeight = `${-1 + beforeHeight - delta}px`;
			after.style.maxHeight  = `${-1 + afterHeight  + delta}px`;
		};

		document.addEventListener('mousemove', onMove);

		const onDrop = () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onDrop);
		};

		document.addEventListener('mouseup', onDrop);
	}

	verticalResizeGrabbed(event)
	{
		const start = event.clientX;
		let before  = event.target.previousSibling;
		let after   = event.target.nextSibling;

		while(before.nodeType !== Node.ELEMENT_NODE && before.previousSibling)
		{
			before = before.previousSibling;
		}

		while(after.nodeType !== Node.ELEMENT_NODE && after.nextSibling)
		{
			after = after.nextSibling;
		}

		const beforeWidth = before.clientWidth;
		const afterWidth  = after.clientWidth;

		before.style.minWidth = `${beforeWidth}px`;
		after.style.minWidth  = `${afterWidth}px`;

		const onMove = (event) => {
			const delta = start - event.clientX;

			if(beforeWidth - delta < 0)
			{
				before.style.minWidth = 0;
				return;
			}

			if(afterWidth + delta < 0)
			{
				after.style.minWidth = 0;
				return;
			}

			before.style.minWidth = `${beforeWidth - delta}px`;
			after.style.minWidth  = `${afterWidth  + delta}px`;
		};

		document.addEventListener('mousemove', onMove);

		const onDrop = () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onDrop);
		};

		document.addEventListener('mouseup', onDrop);
	}
}

Base = Target.mix(Base);
Base = CssSwitch.mix(Base);
Base = ViewProcessor.mix(Base);

export class Window extends Base{};
