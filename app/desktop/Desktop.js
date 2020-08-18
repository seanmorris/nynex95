import { Bag  } from 'curvature/base/Bag';
import { View } from 'curvature/base/View';
import { Home } from '../home/Home';
import { Icon } from '../icon/Icon';

export class Desktop extends View
{
	constructor(args)
	{
		super(args);

		this.template = require('./desktop.tmp');

		this.args.icons = [
			new Icon({
				action: '/apps/icon-explorer'
				, name: 'Icon Explorer'
				, icon: 'shell_window4'
				, path: 'w98'
				, bits: 8
			})
			, new Icon({
				action: '/apps/repo-browser'
				, name: 'Repo Browser'
				, icon: 73
				// , path: 'w98'
			})
			, new Icon({
				action: '/apps/nynepad'
				, name: 'Nynepad'
				, icon: 60
			})
			, new Icon({
				action: '/apps/nynemark'
				, name: 'Nynemark'
				, icon: 'document'
				, path: 'w98'
			})
			, new Icon({
				action: '/apps/window'
				, name: 'Application Window'
				, icon: 3
			})
			, new Icon({
				action: '/apps/task-manager'
				, name: 'Task Manager'
				, icon: 61
			})
		];

		this.args.endIcons = [
			new Icon({
				action: '/apps/nynex-help'
				, name: 'What\'s Nynex?'
				, icon: 'help_book_small'
				, path: 'w98'
				, bits: 4
				, size: 48
			})
			, new Icon({
				action: '/apps/npm-unpkgr'
				, name: 'npm-unpkgr'
				, icon: 'npm'
				, path: 'apps'
				, bits: 24
				// , size: 48
			})
			, new Icon({
				action: '/apps/github'
				, name: 'GitHub'
				, icon: 'github'
				, path: 'apps'
				, bits: 1
				// , size: 48
			})
			, new Icon({
				action: '/apps/clippy'
				, name: 'Summon the Devil'
				, icon: 'doom-eye'
				, path: 'apps'
				, bits: 24
			})
			, new Icon({
				action: '/apps/php'
				, name: 'Run PHP'
				, icon: 'php'
				, path: 'apps'
				, bits: 24
				, size: 48
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

		console.log(windows);

		for(const i in windows)
		{
			console.log(windows[i]);
			windows[i].classes.focused = false;
		}
	}
}
