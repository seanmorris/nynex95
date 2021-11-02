import { View as BaseView } from 'curvature/base/View';

export class HtmlFrame extends BaseView
{
	constructor()
	{
		super();

		this.template = require('./html-frame.tmp');

		this.args.frameSource = '';

		this.args.location = location;
	}

	escapeQuotes(input)
	{
		return String(input).replace(/"/g, '&quot;');
	}

	frameLoaded(event)
	{
	}
}
