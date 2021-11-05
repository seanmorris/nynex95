import { View } from 'curvature/base/View';

export class Diskette extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template = require('./diskette.tmp.html');
	}
}
