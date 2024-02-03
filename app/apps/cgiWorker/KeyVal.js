import { View } from "curvature/base/View";

export class KeyVal extends View
{
	template = require('./keyVal.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.props = {};
	}

	selectProperty($event, key)
	{
		this.lastSelected = key;
	}

	addProperty($event, $subview)
	{
		$subview.args.adding = true;

		this.onTimeout(100, () => $subview.tags.newName.focus());
	}

	cancelAddProperty($event, $subview)
	{
		$subview.args.adding = false;
	}

	confirmAddProperty($event, $subview)
	{
		document.activeElement && document.activeElement.blur();

		if(!this.args.newName)
		{
			this.onTimeout(100, () => $subview.tags.newName.focus());
			return;
		}

		this.args.adding = false;
		this.args.props[this.args.newName] = '';
		this.args.newName = '';


		this.onNextFrame(() => $subview.tags.newName.focus());
	}

	removeProperty(event, key)
	{
		delete this.args.props[key];
	}

}
