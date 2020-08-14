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
			new Icon({name: 'Icon Explorer', icon: 'shell_window4', 'path': 'w98', 'bits': 8})
			, new Icon({name: 'NynePad', icon: 60})
		];

		this.windows = new Bag((win, meta, action, index)=>{

			// console.log(this.windows.list);

		});

		this.args.windows = this.windows.list;
	}
}
