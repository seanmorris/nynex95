import { View } from 'curvature/base/View';

import { Home } from '../home/Home';

export class Icon extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./icon.tmp');

		this.resource = args.action || false;//'/apps/icon-explorer-stats'
		this.action   = args.action || false;//'/apps/icon-explorer'

		this.args.name = args.name || `untitled`;
		this.args.path = args.path || `w95`;
		this.args.size = args.size || `32`;
		this.args.bits = args.bits || `4`;
		this.args.icon = args.icon || '3';

		this.args.bindTo((v,k) => {

			if(undefined === ['path', 'size', 'bits', 'icon'].find(el => el === k))
			{
				return;
			}

			const path = `/${this.args.path}/${this.args.icon}-${this.args.size}-${this.args.bits}bit.png`

			this.args.src = path;

		}, {idle: 1});
	}

	dblclick(event)
	{
		const home = Home.instance();

		switch(typeof this.action)
		{
			case 'string':
				home.run(this.action);
				break;

			case 'function':
				this.action(event);
				break;

		}

	}
}
