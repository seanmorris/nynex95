import { View } from 'curvature/base/View';
import { Bindable } from 'curvature/base/Bindable';

import { Home } from '../home/Home';

let Base = class extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./json.tmp');

		this.args.openBracket  = '{';
		this.args.closeBracket = '}';

		this.args.expanded   = args.expanded === undefined
			? 'expanded'
			: '';

		this.args.expandIcon = this.args.expanded
			? '+'
			: 'x';

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

			if(Array.isArray(v))
			{
				this.args.openBracket  = '[';
				this.args.closeBracket = ']';
			}

			for(const i in v)
			{
				if(typeof v[i] === 'object')
				{
					this.args.json[i] = new Json({expanded: ''}, this);
				}
				else
				{
					this.args.json[i] = v[i];
				}
			}
		});

		if(!this.parent || !(this.parent instanceof Json))
		{
			this.args.topLevel = 'top-level main-content';

			this.expand();
		}
	}

	expand(event, key = null)
	{
		if(key !== null)
		{
			if(!this.args.tree[key])
			{
				return;
			}

			if(typeof this.args.tree[key] !== 'object')
			{
				return;
			}

			let count = 0;

			this.args.json[key].args.tree = this.args.tree[key];

			this.args.json[key].expand(event);

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
