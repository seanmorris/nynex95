import { View } from 'curvature/base/View';

import { Home } from '../home/Home';

let Base = class extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./html.tmp');
	}
}
