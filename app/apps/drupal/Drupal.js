import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

const reloadPhp = () => {
	navigator
	.serviceWorker
	.getRegistration(`${location.origin}/DrupalWorker.js`)
	.then(registration => {
		const action = 'refresh';
		const params = [];
		const token  = crypto.randomUUID();
		registration.active.postMessage({action, params, token});
	});
}

export class Drupal extends Task
{
	static helpText = 'Run Drupal 7';

	title    = 'Drupal 7';
	icon     = '/apps/drupal-16-24bit.png';
	template = require('./main.tmp');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.args.width  = this.window.args.minWidth  = `320px`;
		this.window.args.height = this.window.args.minHeight = `480px`;

		this.init = Date.now();

		const Php = require('php-wasm/PhpWebDrupal').PhpWebDrupal;

		this.php = new Php({persist:{mountPoint: '/persist'}});

		this.window.classes.loading = true;

		this.window.args.content = '';



		this.php.addEventListener('output', event => {
			if(!event.detail)
			{
				return;
			}

			const html = event.detail.join("\n");

			this.window.args.content += html;
		});

		this.window.initFilesystem  = event => this.initFilesystem(event);
		this.window.clearFilesystem = event => this.clearFilesystem(event);
		this.window.startServer     = event => this.startServer(event);
		this.window.openSite        = event => this.openSite(event);

		return Bindable.make(this);
	}

	async initFilesystem()
	{
		await this.php;

		navigator.locks.request("php-persist", async (lock) => {
			this.php.run(require('./init.tmp.php')).then(() => {
				reloadPhp();
			});
		});
	}

	async clearFilesystem()
	{
		navigator.locks.request("php-persist", async (lock) => {
			const openDb = indexedDB.open("/persist", 21);

			openDb.onsuccess = event => {
				const db = openDb.result;
				const transaction = db.transaction(["FILE_DATA"], "readwrite");
				const objectStore = transaction.objectStore("FILE_DATA");
				const objectStoreRequest = objectStore.clear();

				objectStoreRequest.onsuccess = reloadPhp;
			};
		});
	}

	startServer()
	{
		Home.instance().run('cgi-worker')
	}

	openSite()
	{
		window.open('/php-wasm/drupal/');
	}
}
