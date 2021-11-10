import { Bag  } from 'curvature/base/Bag';
import { View } from 'curvature/base/View';
import { Home } from '../home/Home';
import { Icon } from '../icon/Icon';
import { Menu } from '../menu/Menu';

import { FileModel } from '../files/FileModel';
import { FileDatabase } from '../files/FileDatabase';

import { MimeModel } from '../files/MimeModel';
import { MimeDatabase } from '../files/MimeDatabase';

import { Diskette } from '../widgets/diskette/Diskette';

export class Desktop extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template = require('./desktop.tmp');

		// this.args.bg = '/sm-disk-open.png';
		// this.args.bg = '/sm-disk.png';
		this.args.bg = '/dawid-zawila-9d33wIMMzoE-unsplash-crop.jpg';

		this.args.contextMenu = new Menu({items:[
			{
				callback: () => this.createFile()
				, name: 'Create New File'
			}
			, {
				callback: () => {}
				, name: 'Desktop Background'
			}
			, {
				callback: () => {}
				, name: 'Settings'
			}
		]}, this);

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
			// , new Icon({
			// 	action: 'nynemark'
			// 	, name: 'Nynemark'
			// 	, icon: 'document'
			// 	, path: 'w98'
			// })
			// , new Icon({
			// 	action: 'window'
			// 	, name: 'Application Window'
			// 	, icon: 3
			// })
			, new Icon({
				action: 'task-manager'
				, name: 'Task Manager'
				, icon: 'computer_taskmgr'
				, path: 'w98'
			})
			// , new Icon({
			// 	action: 'navigator'
			// 	, path: 'apps'
			// 	, name: 'Navigator'
			// 	, icon: 'navigator'
			// 	, bits: 4
			// })
			, new Icon({
				action: 'console'
				, path: 'apps'
				, name: 'Terminal'
				, icon: 'console'
				, bits: 24
			})
			// , new Icon({
			// 	action: 'console'
			// 	, path: 'apps'
			// 	, name: 'Network Terminal'
			// 	, icon: 'console'
			// 	, bits: 24
			// })
			// , new Icon({
			// 	action: 'curvature'
			// 	, path: 'apps'
			// 	, name: 'Curvature 0.0.61'
			// 	, icon: 'curvature'
			// 	, bits: 8
			// })
			, new Icon({
				action: 'widgets'
				, name: 'Widget Viewer'
				, icon: 61
			})
			, new Icon({
				action: 'file-browser'
				, name: 'File Browser'
				, icon: 5
			})
			, new Icon({
				action: 'cubes'
				, name: 'Cubes 3d'
				, icon: 'cube'
				, path: 'apps'
				, bits: 1
			})
		];

		this.args.endIcons = [
			// new Icon({
			// 	action: 'nynex-help'
			// 	, name: 'What\'s Nynex?'
			// 	, icon: 'help_book_big'
			// 	, path: 'w98'
			// 	, bits: 4
			// 	, size: 32
			// })
			// , new Icon({
			// 	action: 'unpkgr'
			// 	, name: 'unpkgr'
			// 	, icon: 'npm'
			// 	, path: 'apps'
			// 	, bits: 24
			// })
			, new Icon({
				action: 'github'
				, name: 'GitHub Login'
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
			})
			// , new Icon({
			// 	action: 'drupal'
			// 	, name: 'Drupal 7'
			// 	, icon: 'drupal'
			// 	, path: 'apps'
			// 	, bits: 24
			// })
			// , new Icon({
			// 	action: 'dos'
			// 	, name: 'Doom'
			// 	, icon: 'doomguy'
			// 	, path: 'apps'
			// 	, bits: 16
			// })
			, new Icon({
				action: 'clones'
				, name: 'Clones n Barrels'
				, icon: 'barrel'
				, path: 'sm'
				, bits: 24
			})
			, new Icon({
				action: 'sonic3000'
				, name: 'Play Sonic 3000'
				, icon: 'sonic-3000'
				, path: 'ui'
				, bits: 24
			})
			, new Icon({
				action: 'numb'
				, name: 'numb - linkin park.mp3.exe'
				, icon: 'numb'
				, path: 'apps'
				, bits: 8
			})
			// , new Icon({
			// 	action: 'letsvue'
			// 	, name: 'Letsvue'
			// 	, icon: 'letsvue'
			// 	, path: 'apps'
			// 	, bits: 24
			// })
			// , new Icon({
			// 	action: 'harp'
			// 	, name: 'Jasmine\'s Harp'
			// 	, icon: 1
			// 	, bits: 4
			// })
			// , new Icon({
			// 	action: 'flashair'
			// 	, name: 'Flashair'
			// 	, icon: 'flashair'
			// 	, path: 'ui'
			// 	, bits: 24
			// })
			, new Icon({
				action: 'card-editor'
				, name: 'Card Editor'
				, icon: 3
			})
		];

		this.fileDb = FileDatabase.open('files', 1);

		this.fileDb.then(fileDb => {

			const onWrite = event => {
				const file = event.detail.record;

				if(file.directory === '~/desktop/')
				{
					this.listFile(file);
				}
			};

			fileDb.addEventListener('write', onWrite);

			this.onRemove(() => fileDb.removeEventListener('write', onWrite));

			const query = {
				store: 'files'
				, index: 'directory'
				, range: '~/desktop/'
				, type:  FileModel
			};

			fileDb.select(query).each(file => this.listFile(file));
		});
	}

	listFile(file)
	{
		return file.getIcon().then(icon => {
			this.args.endIcons.push(icon);
		});
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
		const menuTag = this.args.contextMenu.tags.menu.element;

		menuTag.style.top = `${event.clientY}px`;
		menuTag.style.left = `${event.clientX}px`;

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
						// this.args.bg = blobUrl;
						console.log(file);
					}
					, name: file.name
					, icon: 1
					, bits: 4
				})
			);

		});
	}

	drop(event)
	{
		event.preventDefault();

		for(const file of event.dataTransfer.files)
		{

			const buffer = file.arrayBuffer();
			const fileDb = this.fileDb;

			Promise.all([buffer, fileDb]).then(([buffer, fileDb])=>{

				const directory = '~/desktop/';

				const query = {
					store: 'files'
					, index: 'path'
					, range: directory + file.name
					, type:  FileModel
				};


				const values = {
					name: file.name
					, lastModified: file.lastModified
					, size: file.size
					, type: file.type
					, path: directory + file.name
					, name: file.name
					, buffer: buffer
					, directory
				};

				fileDb.select(query).one().then(result => {

					let record = result.record;

					if(!record)
					{
						record = FileModel.from(values);
						fileDb.insert('files', record);
					}
					else
					{
						record.consume(values);
						fileDb.update('files', record);
					}
				});
			});
		}
	}

	dragover(event)
	{
		event.preventDefault();
	}
}
