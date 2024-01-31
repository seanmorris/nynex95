import { Router   } from 'curvature/base/Router';
import { View     } from 'curvature/base/View';
import { Mixin    } from 'curvature/base/Mixin';
import { Bindable } from 'curvature/base/Bindable';
import { MenuBar  } from './MenuBar';
import { TitleBar } from './TitleBar';

import { Home } from '../home/Home';

// import { Target        } from '../mixin/Target';
import { CssSwitch     } from '../mixin/CssSwitch';
import { ViewProcessor } from '../mixin/ViewProcessor';

import { Icon } from '../icon/Icon';

export class Window extends Mixin.from(View, ViewProcessor, CssSwitch)
{
	static idInc = 0;

	outlineSpeed = 300;
	outlineDelay = 150;

	constructor(args = {}, parent = null)
	{
		super(args, parent);

		this.subWindows = new Map;

		this.name = window.name;
		this.popBackIn = null;

		this.args.preview = '/w95/1-16-4bit.png';

		this.args.width   = this.args.width  || '690px';
		this.args.height  = this.args.height || '520px';

		this.pos = Bindable.make({x: 160, y: 100, z: 0});

		this.args.icon  = args.icon       || '/w95/3-16-4bit.png';
		this.args.title = this.args.title || 'Application Window';
		this.args.progr = 0;

		this.template = require('./window.tmp');

		this.args.template = this.args.template || '';

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

		this.classes.resizing = false;
		this.classes.resize = true;
		this.classes.pane   = true;
	}

	onRendered(event)
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

		this.args.bindTo('width', (v,k) => {
			element.style.width = v;
			this.args.width = v;
		});

		this.args.bindTo('height', (v,k) => {
			element.style.height = v;
			this.args.height = v;
		});

		this.pos.bindTo('z', (v,k) => {
			element.style.zIndex = v;
			this.args.z = v;
		});

		this.args.bindTo('minWidth', (v,k) => {
			element.style.minWidth = v;
			this.args.minWidth = v;
		});

		this.args.bindTo('minHeight', (v,k) => {
			element.style.minHeight = v;
			this.args.minHeight = v;
		});
	}

	popout()
	{
		const popoutEvent = new CustomEvent('popout', {cancellable: true});

		if(!this.dispatchEvent(popoutEvent))
		{
			return;
		}

		const main = this.tags.window.element;
		const rect = main.getBoundingClientRect();
		const orig = main.parentNode;

		const trimSize = {
			x: window.outerWidth - window.innerWidth + 32
			, y: window.outerHeight - window.innerHeight
		};

		console.log(rect.width, trimSize);

		const features = `screenX=${Math.floor(rect.x + -trimSize.x + window.screenX)}`
			+ `,screenY=${Math.floor(rect.y)  + (trimSize.y * 0.5) + window.screenY}`
			+ `,width=${Math.floor(rect.width + (trimSize.x * 2))}`
			+ `,height=${Math.floor(rect.height + (trimSize.y * 0.5))}`

		console.log(features);

		// const popupSource = '<html><head></head><body>Hello, world!</body></html>';
		// const popupBlob   = new Blob([popupSource], {type: 'text/html'});
		// const popupUrl    = URL.createObjectURL(popupBlob);

		if(!(this.outWindow = window.open(
			location.origin + '/satellite-window'
			, this._id
			, features
		))){
			return;
		}

		this.args.poppedOut = true;

		this.outWindow.document.title = this.args.title;

		const mainUnload = () => {
			this.outWindow.close();
		};

		this.popBackIn = () => {
			const old = this.outWindow;

			this.outWindow = false;

			this.args.hideTitleBar = false;
			this.classes.maximized = this.wasMaximized;
			this.restore();
			this.render(orig);
			this.args.poppedOut = false;
			this.popBackIn = null;

			return old;
		};

		this.name = window.name;

		window.addEventListener('beforeunload', mainUnload);

		this.outWindow.addEventListener('resize', event => {
			this.dispatchEvent(new CustomEvent(
				'resized', {detail:{ target:this, original:event }}
			));
		});

		this.outWindow.addEventListener('load', () => {
			this.outWindow.addEventListener('beforeunload', () => {
				window.removeEventListener('beforeunload', mainUnload);
				this.popBackIn && this.popBackIn();
			});

			const base = this.outWindow.document.createElement('base');

			base.setAttribute('href', origin);

			const newDoc = this.outWindow.document;

			newDoc[ Symbol.for('SeanMorris::Nynex95::ViewRef') ] = this;

			newDoc.head.append(base);

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

			this.name = this.outWindow.name;

			const subScript = document.createElement('script');

			subScript.innerHTML = `(${ () => {

				const interactionEvents = [
					'click',
					// 'contextmenu',
					// 'dblclick',
					// 'mousedown',
					// 'mousemove',
					// 'mouseup',
					// 'pointerdown',
					// 'pointermove',
					// 'pointerup',
					// 'touchend',
					// 'touchmove',
					// 'touchstart',
					// 'keydown',
					// 'keypress',
					// 'keyup',
					// 'change',
					// 'compositionend',
					// 'compositionstart',
					// 'compositionupdate',
					// 'input',
					// 'reset',
					// 'submit',
				];

				interactionEvents.map(eventName => {
					document.addEventListener(
						eventName
						, event => {
							const view = document[ Symbol.for('SeanMorris::Nynex95::ViewRef') ];

							if(view && view.willFocus)
							{
								window.open('', view.willFocus);

								view.willFocus = null;
							}
						}
					);
				});

			} })()`;

			this.outWindow.document.body.append(subScript);

			this.outWindow.document.body.classList.add('sub-window');

			const poppedoutEvent = new CustomEvent('poppedout');

			this.dispatchEvent(poppedoutEvent);
		});
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
		const home = Home.instance();

		this.wasMaximized = false;

		if(this.classes.maximized)
		{
			home.moveOutline(0, 0, '100%', '100%', true);
			this.wasMaximized = true;
		}
		else if(this.tags.window.node)
		{
			home.moveOutline(
				`${this.pos.x}px`
				, `${this.pos.y}px`
				, this.tags.window
					? (this.tags.window.node.style.width  || `${this.args.width}`)
					: `${this.args.width}`
				, this.tags.window
					? (this.tags.window.node.style.height || `${this.args.height}`)
					: `${this.args.height}`
				, true
			);
		}

		home.showOutline();

		this.onTimeout(this.outlineDelay, ()=>{

			if(this.args.taskButton)
			{
				const taskRect = this.args.taskButton.getBoundingClientRect();

				home.moveOutline(
					taskRect.x + 'px'
					, taskRect.y + 'px'
					, taskRect.width + 'px'
					, taskRect.height + 'px'
				);
			}

			const minimizing = new CustomEvent('minimizing', {detail:{ target:this, original:event }});

			if(!this.dispatchEvent(minimizing))
			{
				return;
			}

			// this.classes.minimized = true;
			// this.classes.maximized = false;

			this.onTimeout(this.outlineSpeed / 2, ()=>{
				this.classes.minimized = true;
				this.classes.maximized = false;

				this.dispatchEvent(new CustomEvent(
					'minimized', {detail:{ target:this }}
				));
			});

			this.onTimeout(this.outlineSpeed, () => {
				home.hideOutline();
			});
		});
	}

	restore()
	{
		const restoring = new CustomEvent('restoring', {detail:{ target:this }});

		if(!this.dispatchEvent(restoring))
		{
			return;
		}

		const home = Home.instance();

		if(this.classes.maximized)
		{
			home.moveOutline(0, 0, '100%', '100%', true);
			this.wasMaximized = false;
		}
		else if(this.classes.minimized && this.args.taskButton)
		{
			const taskRect = this.args.taskButton.getBoundingClientRect();

			home.moveOutline(
				taskRect.x + 'px'
				, taskRect.y + 'px'
				, taskRect.width + 'px'
				, taskRect.height + 'px'
				, true
			);
		}
		else if(this.classes.minimized && !this.args.taskButton)
		{
			this.onTimeout(1.5 * this.outlineSpeed, ()=>{
				this.classes.minimized = false;
			});
		}

		home.showOutline();

		this.onTimeout(this.outlineDelay, ()=>{
			if(this.tags.window.element)
			{
				if(this.classes.minimized && this.wasMaximized)
				{
					home.moveOutline(0,0,'100%','100%');
				}
				else
				{
					home.moveOutline(
						`${this.pos.x}px`
						, `${this.pos.y}px`
						, this.tags.window
							? `max(${this.tags.window.node.style.width}, ${this.tags.window.node.style.minWidth || '0px'})`
							: `${this.args.width}`
						, this.tags.window
							? `max(${this.tags.window.node.style.height}, ${this.tags.window.node.style.minHeight || '0px'})`
							: `${this.args.height}`
					);
				}
			}

			this.onTimeout(this.outlineSpeed / 2, () => {
				this.classes.maximized = this.classes.minimized
					? this.wasMaximized
					: false;

				this.classes.minimized = false;

				this.dispatchEvent(new CustomEvent(
					'restored', {detail:{ target:this }}
				));

				this.dispatchEvent(new CustomEvent(
					'resized', {detail:{ target:this, original:event }}
				));
			});

			this.onTimeout(this.outlineSpeed, () => {
				home.hideOutline();
			});
		});
	}

	maximize()
	{
		const home = Home.instance();

		if(this.tags.window.node)
		{
			home.moveOutline(
				`${this.pos.x}px`
				, `${this.pos.y}px`
				, this.tags.window
					? `max(${this.tags.window.node.style.width}, ${this.tags.window.node.style.minWidth || '0px'})`
					: `${this.args.width}`
				, this.tags.window
					? `max(${this.tags.window.node.style.height}, ${this.tags.window.node.style.minHeight || '0px'})`
					: `${this.args.height}`
				, true
			);

			home.showOutline();
		}

		this.onTimeout(this.outlineDelay, () => {

			home.moveOutline(0,0,'100%','100%');

			this.onTimeout(this.outlineSpeed / 2, ()=>{
				this.classes.minimized = false;
				this.classes.maximized = true;

				const maximizing = new CustomEvent('maximizing', {detail:{ target:this }});

				if(!this.dispatchEvent(maximizing))
				{
					return;
				}

				const maximized = new CustomEvent('maximized', {detail:{ target:this }});

				this.dispatchEvent(maximized);

				this.dispatchEvent(new CustomEvent(
					'resized', {detail:{ target:this, original:maximized }}
				));
			});

			this.onTimeout(this.outlineSpeed, ()=>{
				home.hideOutline();
			});

		});
	}

	close()
	{
		const windows = this.windows.items();

		if(!this.dispatchEvent(new CustomEvent('closing', {detail:{ target:this }})))
		{
			return;
		}

		Home.instance().hideOutline();

		if(this.outWindow)
		{
			this.outWindow.close();
		}

		this.dispatchEvent(new CustomEvent(
			'closed', {detail:{ target:this }}
			));

		const prevZ = this.pos.z;

		this.windows.remove(Bindable.make(this));
		this.windows.remove(this);

		this.remove();

		for(const i in windows)
		{
			if(windows[i].pos.z >= prevZ)
			{
				windows[i].pos.z--;
				windows[i].classes.focused = false;
			}
		}
	}

	focus()
	{
		if(!this.dispatchEvent(new CustomEvent('focusing', {detail:{ target:this }})))
		{
			return;
		}

		if(this.outWindow)
		{
			window.open('', this.outWindow.name);
		}
		else if(!this.classes.focused && this.args.cmd && this.args.taskButton)
		{
			const path = this.args.path
				? `/${this.args.path.join('/')}`
				: '';

			Router.go(`/${this.args.cmd}${path}`, 2);

			const home = Home.instance();

			if(this.tags.window.node && !this.classes.minimized)
			{
				home.moveOutline(
					`${this.pos.x}px`
					, `${this.pos.y}px`
					, this.tags.window
						? (this.tags.window.node.style.width  || `${this.args.width}`)
						: `${this.args.width}`
					, this.tags.window
						? (this.tags.window.node.style.height || `${this.args.height}`)
						: `${this.args.height}`
					, true
				);
			}
		}

		const prevZ = this.pos.z;

		const windows = this.windows.items();

		for(const i in windows)
		{
			if(windows[i].pos.z >= prevZ)
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
		if(!(event.buttons & 0x1))
		{
			return;
		}

		const start = { x: this.pos.x, y: this.pos.y};
		const click = { x: event.clientX, y: event.clientY };

		this.classes.moving = true;

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
			this.classes.moving = false;

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
		if(!(event.buttons & 0x1))
		{
			return;
		}

		const start = event.clientY;
		let before  = event.target.previousSibling;
		let after   = event.target.nextSibling;
		let parent  = event.target.parentNode;

		const maxHeight = parent.getBoundingClientRect().height;

		[...parent.childNodes].map(child=>{

			if(child.nodeType !== Node.ELEMENT_NODE)
			{
				return;
			}

			if(child.matches('[data-horizontal-resize]'))
			{
				return;
			}

			if(child.matches('[data-vertical-resize]'))
			{
				return;
			}

			const height = child.getBoundingClientRect().height;

			child.style.minHeight = `${height / maxHeight * 100}%`;
		});

		while((before.nodeType !== Node.ELEMENT_NODE || !before.offsetParent) && before.previousSibling)
		{
			before = before.previousSibling;
		}

		while((after.nodeType !== Node.ELEMENT_NODE || !after.offsetParent) && after.nextSibling)
		{
			after = after.nextSibling;
		}

		const beforeHeight = before.getBoundingClientRect().height / maxHeight * 100;
		const afterHeight  = after.getBoundingClientRect().height / maxHeight * 100;

		const onMove = (event) => {
			const delta = (start - event.clientY) / maxHeight * 100;

			if(beforeHeight - delta < 0)
			{
				return;
			}

			if(afterHeight + delta < 0)
			{
				return;
			}

			before.style.minHeight = `${(beforeHeight) - delta}%`;
			after.style.minHeight  = `${(afterHeight) + delta}%`;

			before.style.flex = 1;
			after.style.flex = 1;
		};

		const localDoc = event.target.getRootNode();

		localDoc.addEventListener('mousemove', onMove);

		this.classes.resizing = true;

		const onDrop = () => {
			localDoc.removeEventListener('mousemove', onMove);
			localDoc.removeEventListener('mouseup', onDrop);
			this.classes.resizing = false;
		};

		localDoc.addEventListener('mouseup', onDrop);
	}

	verticalResizeGrabbed(event)
	{
		if(!(event.buttons & 0x1))
		{
			return;
		}

		const start = event.clientX;
		let before  = event.target.previousSibling;
		let after   = event.target.nextSibling;
		let parent  = event.target.parentNode;

		const maxWidth = parent.getBoundingClientRect().width;

		[...parent.childNodes].map(child=>{

			if(child.nodeType !== Node.ELEMENT_NODE)
			{
				return;
			}

			if(child.matches('[data-horizontal-resize]'))
			{
				return;
			}

			if(child.matches('[data-vertical-resize]'))
			{
				return;
			}

			const width = child.getBoundingClientRect().width;
			const borderWidth = width - child.clientWidth;

			child.style.minWidth = `${width / maxWidth * 100 }%`;
		});

		while((before.nodeType !== Node.ELEMENT_NODE || !before.offsetParent) && before.previousSibling)
		{
			before = before.previousSibling;
		}

		while((after.nodeType !== Node.ELEMENT_NODE || !after.offsetParent) && after.nextSibling)
		{
			after = after.nextSibling;
		}

		const beforeWidth = (before.getBoundingClientRect().width  / maxWidth * 100);
		const afterWidth  = (after.getBoundingClientRect().width / maxWidth * 100);

		const beforeBorder = Math.round(before.getBoundingClientRect().width - before.clientWidth);
		const afterBorder  = Math.round(after.getBoundingClientRect().width - after.clientWidth);

		before.style.minWidth = `${beforeWidth}%`;
		after.style.minWidth  = `${afterWidth}%`;

		const onMove = (event) => {
			const delta = (start - event.clientX) / maxWidth * 100;

			if(beforeWidth - delta < 1)
			{
				before.style.minWidth = 0;
				after.style.minWidth = `calc(${beforeWidth + afterWidth}% - ${beforeBorder}px)`;
				return;
			}

			if(afterWidth + delta < 1)
			{
				after.style.minWidth = 0;
				before.style.minWidth = `calc(${beforeWidth + afterWidth}% - ${afterBorder}px)`;
				return;
			}

			before.style.minWidth = `${beforeWidth - delta}%`;
			after.style.minWidth  = `${afterWidth  + delta}%`;

			before.style.flex = 1;
			after.style.flex = 1;
		};

		const localDoc = event.target.getRootNode();

		localDoc.addEventListener('mousemove', onMove);

		this.classes.resizing = true;

		const onDrop = () => {
			localDoc.removeEventListener('mousemove', onMove);
			localDoc.removeEventListener('mouseup', onDrop);
			this.classes.resizing = false;
		};

		localDoc.addEventListener('mouseup', onDrop);
	}

	subWindow(args)
	{
		const subWindow = new this.constructor(args);

		subWindow.classes.subWindow = true;

		subWindow.addEventListener('closed', event => {
			this.subWindows.delete(subWindow);
		});

		this.subWindows.set(subWindow, undefined);

		return subWindow;
	}
}
