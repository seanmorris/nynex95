import { View } from 'curvature/base/View';


import { Home } from '../home/Home';

export class Image extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./image.tmp');
	}
}
