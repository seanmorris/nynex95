import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

export class NpmUnpkgr extends Task
{
	title    = 'unpkgr';
	icon     = '/apps/npm-16-24bit.png';
	template = require('./main.tmp');

	constructor(taskList)
	{
		super(taskList);

		this.window.args.searchIcon = new Icon({
			icon: 23, size: 16, name: ''
		});;

		this.init = Date.now();

		this.window.args.status = 'initializing...';

		this.window.args.icons = [];
		this.window.args.query = 'curvature';

		this.window.search = (event) => {

			const url = `https://npmsearch.com/query?q=${this.window.args.query}&size=64`;

			event.preventDefault();

			this.window.args.icons = [];


			fetch(url).then(r => r.json()).then(body => {

				if(!body || !body.results)
				{
					return;
				}

				const results = body.results.map((packageData) => {
					for(const propertyName in packageData)
					{
						packageData[propertyName] = packageData[propertyName][0];
					}
					return packageData;
				});

				results.sort((a,b) => {

					if(a.name === this.window.args.query)
					{
						return -1;
					}

					if(b.name === this.window.args.query)
					{
						return 1;
					}

					return 0;

				});

				this.window.args.icons = results.map((packageData, index)=>{

					return new Icon({
						icon: 'file_gears'
						, size: 48
						, path: 'w98'
						, name: packageData.name
						, action: () => Object.assign(this.window.args, packageData)
					});

				});

				this.window.args.icons.push(new Icon({
					path: 'w98'
					, size: 48
					, icon: 'directory_program_group'
					, name: 'more'
				}))

			});

		};

		return Bindable.make(this);
	}

	attached()
	{
	}
}
