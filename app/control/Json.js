import { View } from 'curvature/base/View';
import { Bindable } from 'curvature/base/Bindable';

import { Home } from '../home/Home';

let Base = class extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./json.tmp');

		this.args.expandIcon = '+';
		this.args.expanded   = args.expanded || '';
	}

	attached()
	{
		this.args.bindTo('tree', v => {

			if(!v)
			{
				return;
			}

			this.args.tree = v;

			for(const i in this.args.tree)
			{
				if(typeof this.args.tree[i] === 'object')
				{
					const subTree = this.args.tree[i];

					this.args.tree[i] = new Json({}, this);
					this.args.tree[i].args.tree = subTree;
				}
			}
		});

		if(!this.parent || !(this.parent instanceof Json))
		{
			this.args.topLevel = 'top-level main-content';
		}
	}

	expand(event, key)
	{
		console.log(key);

		if(key)
		{
			if(!this.args.tree[key])
			{
				return;
			}

			this.args.tree[key].expand(event);

			return;
		}

		this.args.expanded = this.args.expanded
			? ''
			: 'expanded';

		this.args.expandIcon = this.args.expanded
			? '+'
			: 'x';
	}

	type(value)
	{
		return typeof value;
	}

}

export class Json extends Base{};
