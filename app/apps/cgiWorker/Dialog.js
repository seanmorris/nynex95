import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { HtmlFrame } from '../../control/HtmlFrame'

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import * as ace from 'brace';

import 'brace/mode/php';
import 'brace/mode/markdown';
import 'brace/theme/monokai';

import { Console as Terminal } from 'subspace-console/Console';

const Range = ace.acequire('ace/range').Range;

const incomplete = new Map;

export class Dialog extends Task
{
	static helpText = 'Run PHP in your browser.';

	title    = 'CGI Service Worker';
	icon     = '/apps/php-16-24bit.png';
	template = require('./dialog.tmp');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.args.width  = this.window.args.minWidth  = `600px`;
		this.window.args.height = this.window.args.minHeight = `260px`;

		this.window.args.headerIcon = new Icon({
			action: (event) => {}
			, depth: 8
			, size: 48
			, icon: 'channels_file'
			, path: 'w98'
		});

		this.window.args.runningIcon = new Icon({
			action: (event) => {}
			, depth: 4
			, size: 16
			, icon: 'check'
			, path: 'w98'
		});

		this.window.args.stoppedIcon = new Icon({
			action: (event) => {}
			, depth: 4
			, size: 16
			, icon: 'msg_warning'
			, path: 'w98'
		});

		this.window.startService = event => this.startService(event);
		this.window.stopService  = event => this.stopService(event);
		this.window.about        = event => this.about(event);

		this.args.bindTo('registration', v => this.window.args.started = !!v);

		const serviceWorker = navigator.serviceWorker;

		this.window.args.log = [];

		serviceWorker.addEventListener('message', event => {
			if(event.data.re)
			{
				const callback = incomplete.get(event.data.re);

				callback(event.data.result);

				return;
			}

			if(!event.data.params)
			{
				return;
			}

			const [line, detail] = event.data.params;

			detail.text = line;

			switch(event.data.action)
			{
				case 'logRequest':
				{
					this.window.args.log.unshift(detail);
					// this.window.onNextFrame(()=>{
					// 	this.window.tags.log.scrollTo({
					// 		behavior: 'smooth'
					// 		, top: this.window.tags.log.scrollHeight
					// 	});
					// })

					while(this.window.args.log.length > 100)
					{
						this.window.args.log.pop();
					}
				}
				break;

				default:
				{
					console.log(event.data);
				}
				break;
			}
		});

		this.window.onInterval(100, () => {
			serviceWorker.getRegistration(`${location.origin}/DrupalWorker.js`)
			.then(registration => this.args.registration = registration);
		});
	}

	startService(event)
	{
		const serviceWorker = navigator.serviceWorker;

		if(!this.args.registration)
		{
			serviceWorker.register(`${location.origin}/DrupalWorker.js`)
			.then(registration => this.args.registration = registration);
		}

		serviceWorker.ready.then(registration => this.args.registration = registration);
	}

	stopService(event)
	{
		if(!this.args.registration)
		{
			return;
		}

		this.args.registration.unregister()
		.then(success => {
			if(success)
			{
				console.log(this.args.registration);
				this.args.registration = null;
			}
		})
	}

	sendMessage(action, params, callback)
	{
		const token = crypto.randomUUID();

		incomplete.set(token, callback);

		this.args.registration.active.postMessage({action, params, token});
	}

	about()
	{
		// const aboutArgs = {
		// 	template: require('./about.tmp')
		// 	, title:  'About...'
		// 	, width:   '480px'
		// 	, height:  '600px'
		// };

		// const subWindow = this.openSubWindow(aboutArgs);

		// subWindow.focus();

		// if(!this.args.registration)
		// {
		// 	return;
		// }

		this.sendMessage('readFile', ['/persist/drupal-7.95/sites/default/settings.php'], result => {

			console.log(result);
			console.log(new TextDecoder().decode(result));

		})

		// this.args.registration.active.postMessage({
		// 	action:   'readdir'
		// 	, params: ['/persist/drupal-7.95']
		// 	, token:  crypto.randomUUID()
		// });

		// this.args.registration.active.postMessage({
		// 	action:   'readFile'
		// 	, params: ['/persist/drupal-7.95/sites/default/settings.php']
		// 	, token:  crypto.randomUUID()
		// });

		// new TextDecoder().decode(uint8array);
	}
}
