import { Task } from 'task/Task';
import { MenuBar  } from '../../window/MenuBar';
import { Icon } from '../../icon/Icon';
import { Icons as IconControl } from '../../control/Icons';
import { Home } from '../../home/Home';

import { FileModel } from '../../files/FileModel';
import { FileDatabase } from '../../files/FileDatabase';

import { MimeModel } from '../../files/MimeModel';
import { MimeDatabase } from '../../files/MimeDatabase';

export class FileBrowser extends Task
{
	title    = 'File Browser';
	icon     = '/w95/5-16-4bit.png';
	template = require('./main.tmp');
	useProxy = false;

	constructor(taskList, taskCmd = '', taskPath = [])
	{
		super(taskList, taskCmd, taskPath);

		this.window.args.iconList = new IconControl({}, this);

		this.window.args.directory = taskPath[0] || '~/desktop/';
		this.window.args._id = this.window._id;

		this.selector = IDBKeyRange.only(this.window.args.directory);

		this.fileDb = FileDatabase.open('files', 1);
		this.mimeDb = MimeDatabase.open('mime-types', 1);

		this.loadDirectory();

		this.importMimes();

		this.window.args.menus = {
			File: {
				'New File':     { callback: () => {} }
				, 'New Folder': { callback: () => this.createDirectory() }
				, Quit:         { callback: () => this.window.close() }
			}
			// , Edit: {
			// 	Undo: { callback: () => document.execCommand("undo") }
			// 	, Redo: { callback: () => document.execCommand("redo") }
			// 	, Cut: { callback: () => document.execCommand("cut") }
			// 	, Copy: { callback: () => document.execCommand("copy") }
			// 	, Delete: { callback: () => document.execCommand("delete") }
			// }
		};

		this.window.drop = (event) => {
			event.preventDefault();

			for(const file of event.dataTransfer.files)
			{

				const buffer = file.arrayBuffer();
				const fileDb = this.fileDb;

				Promise.all([buffer, fileDb]).then(([buffer, fileDb])=>{

					const directory = this.window.args.directory;

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

		this.window.dragover = (event) => {
			event.preventDefault();
		}
	}

	attached()
	{
		this.window.args.menuBar  = new MenuBar(this.window.args, this.window);

		this.window.args.bindTo('document', (v,k,t,d) => {

			this.window.args.charCount = v ? v.length : 0;

		});
	}

	importMimes()
	{
		const openDb = MimeDatabase.open('mime-types', 1);
		const fetchMimes = fetch('/static/mime.json').then(r => r.json());

		Promise.all([openDb, fetchMimes]).then(([db, mimes]) => {

			for(const [extension, mimeInfo] of Object.entries(mimes))
			{
				let type = mimeInfo;

				if(typeof mimeInfo === 'object')
				{
					mimeInfo.extension = extension;
					type = mimeInfo.type;
				}
				else
				{
					mimeInfo = { extension, type:mimeInfo };
				}

				const store = 'mime-types'
				const index = 'extension';
				const range = extension;

				db.select({store,index,range,type:MimeModel}).one().then(result => {
					if(!result.index)
					{
						const mime = MimeModel.from(mimeInfo)
						db.insert('mime-types', mime);
					}
					else
					{
						result.result.consume(mimeInfo);
						db.update('mime-types', result.result);
					}
				});
			}
		});
	}

	createDirectory()
	{
		this.fileDb.then(fileDb => {

			const newDirectory = new FileModel;
			const name = "New Directory @ " + Date.now();

			const path = String(this.window.args.directory)
				.split('/')
				.filter(p => p)
				.join('/')
				+ '/'
				+ name;

			newDirectory.consume({
				directory: this.window.args.directory
				, type: "file-folder/directory"
				, name
				, path
			});

			fileDb.insert('files', newDirectory);
		});
	}

	loadDirectory()
	{
		const iconList = this.window.args.iconList

		const ready = Promise.all([this.fileDb, this.mimeDb]);

		ready.then(([fileDb, mimeDb]) => {

			this.window.listen(fileDb, 'write', event => {

				const file = event.detail.record;

				if(!this.selector.includes(file.directory))
				{
					return;
				}

				// this.window.listen(icon, 'select', event => console.log(event));

				this.getIcon(file).then(icon => iconList.args.icons.push(icon));
			});

			const query = {
				store: 'files'
				, index: 'directory'
				, range: this.window.args.directory
				, type:  FileModel
			};

			fileDb.select(query).each(file => {
				const bytes = new Uint8Array(file.buffer);
				const blobUrl = URL.createObjectURL(new Blob([file.buffer], {type:file.type}));

				this.getIcon(file).then(icon => {
					iconList.args.icons.push(icon);
				});
			});

			this.window.args.title = this.window.args.directory;
		});
	}

	getIcon(file)
	{
		const extension = '.' + file.name.split('.').pop();

		const query = {store:'mime-types', index: 'extension', range: extension};

		const openMimeDb = this.mimeDb;

		if(file.type === 'file-folder/directory')
		{
			const icon = new Icon({
				// action: () => Home.instance().run(`file-browser`, [file.path+file.name])
				action: () => Home.instance().run(`file-browser`, [file.path])
				, name: file.name
				, path: 'w95'
				, icon: 4
				, bits: 4
				, file
				, mime:{type:'file-folder/directory'}
			});

			icon.addEventListener('select', event => {
				this.window.args.selectedModified = event.detail.file.lastModified;
				this.window.args.selectedFilename = event.detail.file.name;
				this.window.args.selectedFileSize = event.detail.file.size;
				this.window.args.selectedFileType = event.detail.mime.type;
			});

			return Promise.resolve(icon);
		}

		return openMimeDb.then(database => database.select(query).one().then(result => {
			const mime = result.record;

			let image = 1;
			let bits  = 4;
			let path  = 'w95';

			if(mime && mime.icon)
			{
				image = mime.icon.icon;
				path  = mime.icon.path;
			}

			const icon = new Icon({
				action: (...args) => {
					const url = URL.createObjectURL(new Blob([file.buffer]), {type: file.type});
					Home.instance().run(`image-viewer`, [url])
				}
				, name: file.name
				, icon: image
				, bits
				, path
				, file
				, mime
			});

			icon.addEventListener('select', event => {
				this.window.args.selectedModified = event.detail.file.lastModified;
				this.window.args.selectedFilename = event.detail.file.name;
				this.window.args.selectedFileSize = event.detail.file.size;
				this.window.args.selectedFileType = event.detail.mime.type;
			});

			return icon;
		}));
	}

	openFile()
	{

	}

	promptForFileAction()
	{

	}
}
