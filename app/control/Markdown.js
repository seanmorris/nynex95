import { View } from 'curvature/base/View';
import { View as CvMarkdown } from 'cv-markdown/View'

export class Markdown extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template      = require('./markdown.tmp');
		this.args.rendered = new CvMarkdown({source:args.content});
	}
}
