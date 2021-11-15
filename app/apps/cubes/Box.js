import { Cube } from './Cube';

export class Box extends Cube
{
	template = require('./box.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.mass  = Infinity;

		this.args.interior = this.args.interior || false;
	}

	collide(other)
	{
		super.collide(other);

		if(this.args.interior)
		{
			this.parent.exterior = true;
		}
	}

	leave(other)
	{
		super.leave(other);

		if(this.args.interior)
		{
			this.parent.exterior = false;
		}
	}
}
