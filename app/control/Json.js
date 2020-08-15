import { View } from 'curvature/base/View';


import { Home } from '../home/Home';

let Base = class extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./json.tmp');

		this.args.bindTo('content', v => {

			if(!v)
			{
				return;
			}

			this.args.tree = JSON.parse(v);

			for(const i in this.args.tree)
			{
				if(typeof this.args.tree[i] === 'object')
				{
					this.args.tree[i] = new Json(
						{tree:this.args.tree[i]}
						, this
					);
				}
			}
		});
	}

	attached()
	{
		if(!this.parent || !(this.parent instanceof Json))
		{
			this.args.topLevel = 'top-level';
		}
	}

	type(value)
	{
		return typeof value;
	}

}

export class Json extends Base{};