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

		this.args.expanded = args.expanded === undefined
			? 'expanded'
			: '';

		this.args.expandIcon = this.args.expanded
			? 'x'
			: '+';

		this.args.tree = this.args.tree || {};
		this.args.json = this.args.json || {};

		this.args.bindTo('content', v => {
			try
			{
				this.args.tree = v ? JSON.parse(v) : null;
			}
			catch(error)
			{
				this.args.tree = null;
			}
		});

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

			this.args.json = {};

			let ii = 0;

			for(const i in v)
			{
				this.onTimeout(35 * ii, ()=>{
					if(typeof v[i] === 'object')
					{
						this.args.json[i] = new Json({expanded: ''}, this);
					}
					else
					{
						this.args.json[i] = v[i];
					}
				});
			}
		});
	}

	attached()
	{
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
			? 'x'
			: '+';
	}

	type(value)
	{
		return typeof value;
	}

}

export class Json extends Base{};
