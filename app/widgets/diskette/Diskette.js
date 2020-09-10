import { View } from 'curvature/base/View';

export class Diskette extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		console.log(this);

		this.template = require('./diskette.tmp.html');
	}
}
