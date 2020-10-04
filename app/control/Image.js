import { View } from 'curvature/base/View';


import { Home } from '../home/Home';

export class Image extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.src = args.src || '';

		this.template  = require('./image.tmp');
	}
}
