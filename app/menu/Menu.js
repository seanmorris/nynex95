import { Bindable } from 'curvature/base/Bindable';
import { View } from 'curvature/base/View';
import { Home } from '../home/Home';

import { FileModel } from '../files/FileModel';
import { FileDatabase } from '../files/FileDatabase';

export class Menu extends View
{
	constructor(args = {}, parent, level)
	{
		super(args, parent);

		this.items = args.items;

		this.args.classes = args.classes || ['context'];
		this.args.items   = args.items   || [];
		this.args.menu    = '';

		this.template = require('./menu.tmp');

		let init = Promise.resolve();

		for(let item of this.args.items)
		{
			item = Bindable.make(item);

			if(!('menu' in item))
			{
				return;
			}

			const submenu = item.menu;

			if(item.folder)
			{
				item.menu = new Menu({items:Bindable.make(submenu)});
				this.loadFolder(item);
			}
			else if(typeof submenu === 'object' && !(submenu instanceof Menu))
			{
				item.menu = new Menu({items:submenu});
			}
		}
	}

	loadFolder(item)
	{
		const query = {
			store: 'files'
			, index: 'directory'
			, range: item.folder
			, type:  FileModel
		};

		const fileDb = FileDatabase.open('files', 1);

		const getIcons = [];

		if(item.menu)
		{
			item.menu.args.items = item.menu.args.items ?? [];
			item.menu.args.items.splice(0);
		}

		return fileDb.then(db => db.select(query).each(file => {
			getIcons.push(file.getIconPath({size: 16}).then(icon => {
				if(file.type === 'file-folder/directory')
				{
					item.menu.args.items.push({
						icon
						, name: file.name
						, folder: file.path
						, menu: new Menu({items:Bindable.make([])})
					});
				}
				else
				{
					item.menu.args.items.push({
						icon
						, name: file.name
						, folder: file.path
						, callback: () => FileModel.runFile(file).then(cmd => {
							console.log(file, cmd);
							Home.instance().run(...cmd)
						})
					});
				}

				return icon;
			}));
		})).then(() => Promise.all(getIcons));
	}

	join(list)
	{
		return list.join(' ');
	}

	call(event, item)
	{
		event.preventDefault();
		event.stopPropagation();

		if(item.folder)
		{
			this.loadFolder(item);
		}

		if(item.path)
		{
			const home = Home.instance();
			home.run(item.path);
			event.target.blur();
		}
		else if(item.callback)
		{
			event.target.blur();
			item.callback(event, item);
		}

	}
}
