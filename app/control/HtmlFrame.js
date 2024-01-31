import { View as BaseView } from 'curvature/base/View';

export class HtmlFrame extends BaseView
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template = require('./html-frame.tmp');

		this.args.frameSource = '';

		this.args.hostname = location.hostname;
		this.args.origin   = location.origin;
	}

	escapeQuotes(input)
	{
		return String(input).replace(/"/g, '&quot;');
	}

	frameLoaded(event)
	{
	}
}
