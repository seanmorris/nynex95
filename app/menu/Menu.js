import { View } from 'curvature/base/View';

export class Menu extends View
{
	constructor(args = {}, parent)
	{
		super(args, parent);

		this.items = args.items;

		this.args.classes = args.classes || ['context'];
		this.args.items   = args.items   || {}

		this.template = require('./menu.tmp');
	}

	postRender()
	{
		console.log(this.tags.menu);
	}

	join(list)
	{
		return list.join(' ');
	}

	call(event, item)
	{
		console.log(this.items[item]());

		event.target.blur();
		// callback(event);
	}

	// blur()
	// {
	// 	const menuTag = this.tags.menu.element;

	// 	menuTag.style.display = '';
	// }
}
