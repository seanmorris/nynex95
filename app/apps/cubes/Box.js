import { Cube } from './Cube';

export class Box extends Cube
{
	template = require('./box.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.mass  = Infinity;
	}
}
