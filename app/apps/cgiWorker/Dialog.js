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

import { KeyVal } from './KeyVal';

const Range = ace.acequire('ace/range').Range;

const incomplete = new Map;

export class Dialog extends Task
{
	static helpText = 'Run PHP in your browser.';

	title    = 'CGI Service Worker';
	icon     = '/apps/php-16-24bit.png';
	template = require('./dialog.tmp');

	menus = {
		File: {
			'Explore': { callback: () => {} }
			, 'Open IDE': { callback: () => {} }
			, 'Install Package': { callback: () => {} }
			, Quit: { callback: () => {} }
		}
		, Setup: {
			'CGI Settings': { callback: () => this.cgiSettings() }
			, 'Env vars': { callback: () => this.envEditor() }
			, 'php.ini': { callback: () => this.iniEditor() }
			, 'Restart PHP': { callback: () => this.refresh() }
		}
		, Help: {
			About: { callback: () => {} }
		}
	};

	menuBar = new MenuBar(this, this.window);

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.args.width  = this.window.args.minWidth  = `600px`;
		this.window.args.height = this.window.args.minHeight = `300px`;

		this.window.args.kv = new KeyVal;

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
		this.window.sponsor      = event => this.sponsor(event);

		this.args.bindTo('registration', v => this.window.args.started = !!v);

		this.willScroll = false;

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
					console.log(detail.text);

					this.window.args.log.push(Bindable.make(detail));

					while(this.window.args.log.length > 100)
					{
						this.window.args.log.shift();
					}

					this.willScroll && clearTimeout(this.willScroll);

					this.willScroll = this.window.onTimeout(3,()=>{
						this.willScroll = false;
						this.window.tags.log && this.window.tags.log.scrollTo({
							behavior: 'smooth'
							, top: this.window.tags.log.scrollHeight
						});
					});
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

		console.log({action, params, callback, token});

		incomplete.set(token, callback);

		this.args.registration.active.postMessage({action, params, token});
	}

	async iniEditor()
	{
		const subArgs = Bindable.make({
			template: require('./edit-ini.tmp.html')
			, title: 'Edit php.ini'
			, phpIni:    ''
			, width:     '400px'
			, minWidth:  '400px'
			, height:    '200px'
			, minHeight: '200px'
		});

		await new Promise(accept => {
			this.sendMessage('analyzePath', ['/config'], result => {
				if(!result.exists)
				{
					this.sendMessage('mkdir', ['/config'], result => {
						accept(result);
					});
				}
				accept(result);
			});
		});

		await new Promise(accept => {

			this.sendMessage('analyzePath', ['/config/php.ini'], result => {
				if(!result.exists)
				{
					accept();
				}

				this.sendMessage('readFile', ['/config/php.ini'], result => {
					subArgs.phpIni = new TextDecoder().decode(result);
				});

				accept();
			});
		});

		const subWindow = this.openSubWindow(subArgs);

		subWindow.save = () => {
			console.log(subArgs.phpIni);
			this.sendMessage('writeFile', ['/config/php.ini', subArgs.phpIni], result => {
				subWindow.close()
				console.log(result);
			});
		};

		subWindow.cancel = () => subWindow.close();

		subWindow.focus();
	}

	async envEditor()
	{
		const subArgs = {
			template: require('./edit-kv.tmp.html')
			, title: 'Edit Env Vars'
			, width:     '535px'
			, minWidth:  '450px'
			, height:    '450px'
			, minHeight: '400px'
			, kv:      new KeyVal
		};

		const subWindow = this.openSubWindow(subArgs);

		subWindow.save = () => {
			this.sendMessage('setEnvs', [{...subWindow.args.kv.args.props}], result => {
				console.log(result);
				subWindow.close()
			});
		};

		await new Promise(accept => {
			this.sendMessage('getEnvs', [], result => {
				console.log(result);
				Object.assign(subWindow.args.kv.args.props, result);
				accept();
			});
		});

		subWindow.cancel = () => subWindow.close();

		subWindow.focus();
	}

	async cgiSettings()
	{
		const subArgs = {
			template: require('./cgi-settings.tmp.html')
			, title: 'CGI settings'
			, width:     '580px'
			, minWidth:  '580px'
			, height:    '440px'
			, minHeight: '440px'
		};

		await new Promise(accept => {
			this.sendMessage('getSettings', [], result => {
				Object.assign(subArgs, result);
				accept(result);
			});
		});

		const subWindow = this.openSubWindow(subArgs);

		subWindow.save = () => {

			const settings = {
				docroot: subArgs.docroot ?? this.docroot
				, maxRequestAge: subArgs.maxRequestAge ?? this.maxRequestAge
				, staticCacheTime: subArgs.staticCacheTime ?? this.staticCacheTime
				, dynamicCacheTime: subArgs.dynamicCacheTime ?? this. dynamicCacheTime
			}

			this.sendMessage('setSettings', [settings], result => {
				console.log(result);
				subWindow.close()
			});

		};

		subWindow.cancel = () => subWindow.close();

		subWindow.focus();
	}

	about()
	{
		const aboutArgs = {
			template: require('./about.tmp')
			, title:  'About...'
			, width:   '480px'
			, height:  '600px'
		};

		const subWindow = this.openSubWindow(aboutArgs);

		subWindow.focus();
	}

	sponsor()
	{
		window.open('https://github.com/sponsors/seanmorris');
	}

	refresh()
	{
		this.sendMessage('refresh', [], result => {
			console.log(result);
		});
	}

	quit()
	{
		this.window.close();
	}
}
