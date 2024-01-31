import { View } from 'curvature/base/View';
import { Markdown as CvMarkdown} from 'cv-markdown/Markdown'

export class Markdown extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template      = require('./markdown.tmp');
		this.args.rendered = 'loading';
		this.args.bindTo('content', v => {
			this.args.rendered = new CvMarkdown({source:v});
		});
	}
}
