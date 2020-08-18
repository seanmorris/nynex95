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
		this.args.expanded   = args.expanded || 'expanded';

		this.args.tree = this.args.tree || {};
		this.args.json = this.args.json || {};
	}

	attached()
	{
		this.args.bindTo('tree', v => {

			if(!v)
			{
				return;
			}

			for(const i in v)
			{
				if(typeof v[i] === 'object')
				{
					this.args.json[i] = new Json({}, this);
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
		if(key)
		{
			if(!this.args.tree[key])
			{
				return;
			}

			if(!this.args.tree[key].args.tree)
			{
				this.args.json[key].args.tree = this.args.tree[key];
			}

			if(typeof this.args.tree[key] !== 'object')
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
