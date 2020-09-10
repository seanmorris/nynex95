import { Bag  } from 'curvature/base/Bag';
import { View } from 'curvature/base/View';
import { Home } from '../home/Home';
import { Icon } from '../icon/Icon';
import { Menu } from '../menu/Menu';

import { Diskette } from '../widgets/diskette/Diskette';

export class Desktop extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template = require('./desktop.tmp');

		// this.args.bg = '/dawid-zawila-9d33wIMMzoE-unsplash-crop.jpg';
		// this.args.bg = '/sm-disk.png';
		this.args.bg = '/sm-disk-open.png';

		this.args.contextMenu = new Menu({items: {

			'Create New File':      () => this.createFile()
			, 'Desktop Background': () => {}
			, 'Settings':           () => {}

		}}, this);

		this.args.icons = [
			new Icon({
				action: 'icon-explorer'
				, name: 'Icon Explorer'
				, icon: 'shell_window4'
				, path: 'w98'
				, bits: 8
			})
			, new Icon({
				action: 'repo-browser'
				, name: 'Repo Browser'
				, icon: 73
				// , path: 'w98'
			})
			, new Icon({
				action: 'nynepad'
				, name: 'Nynepad'
				, icon: 60
			})
			, new Icon({
				action: 'nynemark'
				, name: 'Nynemark'
				, icon: 'document'
				, path: 'w98'
			})
			, new Icon({
				action: 'window'
				, name: 'Application Window'
				, icon: 3
			})
			, new Icon({
				action: 'task-manager'
				, name: 'Task Manager'
				, icon: 'computer_taskmgr'
				, path: 'w98'
			})
			, new Icon({
				action: 'navigator'
				, path: 'apps'
				, name: 'Navigator'
				, icon: 'navigator'
				, bits: 4
			})
			, new Icon({
				action: 'console'
				, path: 'apps'
				, name: 'Terminal'
				, icon: 'console'
				, bits: 24
			})
			, new Icon({
				action: 'console'
				, path: 'apps'
				, name: 'Network Terminal'
				, icon: 'console'
				, bits: 24
			})
			, new Icon({
				action: 'curvature'
				, path: 'apps'
				, name: 'Curvature 0.0.61'
				, icon: 'curvature'
				, bits: 8
			})
			, new Icon({
				action: 'widgets'
				, name: 'Widgets'
				, icon: 1
			})
		];

		this.args.endIcons = [
			new Icon({
				action: 'nynex-help'
				, name: 'What\'s Nynex?'
				, icon: 'help_book_big'
				, path: 'w98'
				, bits: 4
				, size: 32
			})
			, new Icon({
				action: 'npm-unpkgr'
				, name: 'npm-unpkgr'
				, icon: 'npm'
				, path: 'apps'
				, bits: 24
				, size: 32
			})
			, new Icon({
				action: 'github'
				, name: 'GitHub'
				, icon: 'github'
				, path: 'apps'
				, bits: 2
				// , size: 48
			})
			, new Icon({
				action: 'clippy'
				, name: 'Summon the Devil'
				, icon: 'doom-eye'
				, path: 'apps'
				, bits: 24
			})
			, new Icon({
				action: 'php'
				, name: 'Run PHP'
				, icon: 'php'
				, path: 'apps'
				, bits: 24
				, size: 48
			})
			, new Icon({
				action: 'drupal'
				, name: 'Drupal 7'
				, icon: 'drupal'
				, path: 'apps'
				, bits: 24
				, size: 32
			})
			, new Icon({
				action: 'dos'
				, name: 'Doom'
				, icon: 'doomguy'
				, path: 'apps'
				, bits: 16
			})
			, new Icon({
				action: 'clones'
				, name: 'Clones n Barrels'
				, icon: 'barrel'
				, path: 'sm'
				, bits: 24
				, size: 32
			})
			, new Icon({
				action: 'numb'
				, name: 'numb - linkin park.mp3.exe'
				, icon: 'numb'
				, path: 'apps'
				, bits: 8
				, size: 32
			})
			, new Icon({
				action: 'tooltime'
				, name: 'tooltime remix.mp3.exe'
				, icon: 'tooltime-remix'
				, path: 'apps'
				, bits: 8
				, size: 32
			})
		];

		// this.windows = new Bag((win, meta, action, index)=>{

		// 	// console.log(this.windows.list);

		// });

		// this.args.windows = this.windows.list;
	}

	focus(event)
	{
		const windows = Home.instance().windows.items();

		for(const i in windows)
		{
			windows[i].classes.focused = false;
		}
	}

	contextmenu(event)
	{
		console.log(event.clientX, event.clientY);

		const menuTag = this.args.contextMenu.tags.menu.element;

		console.log(menuTag);

		menuTag.style.top = `${event.clientY}px`;
		menuTag.style.left = `${event.clientX}px`;

		console.log(menuTag.focus());

		event.preventDefault();

		// this.onTimeout(1500, ()=> event.target.dispatchEvent(event) );
	}

	createFile()
	{
		const upload = document.createElement('input');
		upload.setAttribute('type','file');
		upload.click();

		upload.addEventListener('input', (event) => {

			if(!upload.files.length)
			{
				return;
			}

			const file = upload.files[0];

			const blobUrl = URL.createObjectURL(file);

			this.args.endIcons.push(
				new Icon({
					action: () => {

						this.args.bg = blobUrl;
						// console.log(file);
					}
					, name: file.name
					, icon: 1
					, bits: 4
				})
			);

		});
	}
}
