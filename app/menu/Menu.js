import { View } from 'curvature/base/View';
import { Home } from '../home/Home';

export class Menu extends View
{
	constructor(args = {}, parent, level)
	{
		super(args, parent);

		this.items = args.items;

		this.args.classes = args.classes || ['context'];
		this.args.items   = args.items   || [];
		this.args.menu    = '';

		this.template = require('./menu.tmp');

		for(const item of this.args.items)
		{
			const submenu = item.menu;

			if(!submenu)
			{
				continue;
			}

			if(typeof submenu === 'object' && !(submenu instanceof Menu))
			{
				item.menu = new Menu({items:submenu});
			}
		}
	}

	join(list)
	{
		return list.join(' ');
	}

	call(event, item)
	{
		event.preventDefault();
		event.stopPropagation();

		if(item.path)
		{
			const home = Home.instance();
			home.run(item.path);
			event.target.blur();
		}
		else if(item.callback)
		{
			event.target.blur();
			item.callback(event, item);
		}

	}
}
