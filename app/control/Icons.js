import { View } from 'curvature/base/View';

import { Home } from '../home/Home';

export class Icons extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.icons = this.args.icons || [];

		this.template  = require('./icons.tmp');
	}
}
