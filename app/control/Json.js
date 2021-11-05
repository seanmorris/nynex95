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

			let ii = 0;

			for(const i in v)
			{
				if(typeof v[i] === 'object')
				{
					this.onTimeout(ii++, () => {
						if(!this.args.json[i])
						{
							this.args.json[i] = new Json({expanded: '', parentKey: i}, this);
						}

						if(v[i] instanceof Array)
						{
							this.args.json[i].args.openBracket  = '[';
							this.args.json[i].args.closeBracket = ']';
						}
					});
				}
				else
				{
					this.args.json[i] = v[i];
				}
			}
		});

		this.args.json.bindTo((v,k)=>{

			if(!(v instanceof Json))
			{
				this.args.tree[k] = v;

				const content = JSON.stringify(this.args.tree, null, 4);

				this.args.content = content;

				let current = this;

				while(current)
				{
					if(current && current.args.parentKey && current.parent instanceof Json)
					{
						current.parent.args.tree[ current.args.parentKey ][k] = current.args.tree[k];

						current.parent.args.content = JSON.stringify(current.parent.args.tree, null, 4);

						k = current.args.parentKey;
					}
					else
					{
						break;
					}

					current = current.parent;
				}

			}


		},{wait:0});
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

	toggleEdit(event, $subview, key = null)
	{
		$subview.args.editing = !$subview.args.editing;
	}

	type(value)
	{
		return typeof value;
	}

}

export class Json extends Base{};
