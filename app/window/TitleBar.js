import { View } from 'curvature/base/View';

// import { ViewProcessor } from '../mixin/ViewProcessor';

export class TitleBar extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template = require('./titleBar.tmp');
	}
}
