import { View } from 'curvature/base/View';

import { Home } from '../home/Home';

export class Icons extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.icons = args.icons || [];

		this.template  = require('./icons.tmp');
	}
}
