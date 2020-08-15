import { View } from 'curvature/base/View';

import { Home } from '../home/Home';

export class Plaintext extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./plaintext.tmp');
	}
}
