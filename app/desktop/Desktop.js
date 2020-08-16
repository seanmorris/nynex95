import { Bag  } from 'curvature/base/Bag';
import { View } from 'curvature/base/View';

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
			})
			, new Icon({
				action: '/apps/nynepad'
				, name: 'Nynepad'
				, icon: 60
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
			, new Icon({
				action: '/apps/github'
				, name: 'GitHub'
				, icon: 61
			})
			, new Icon({
				action: '/apps/clippy'
				, name: 'Summon the Devil'
				, icon: 3
			})
		];

		this.windows = new Bag((win, meta, action, index)=>{

			// console.log(this.windows.list);

		});

		this.args.windows = this.windows.list;
	}
}
