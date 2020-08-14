import { View } from 'curvature/base/View';

export class MenuBar extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template = require('./menuBar.tmp');
	}
}
