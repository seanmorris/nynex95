import { Cube } from './Cube';

export class Slope extends Cube
{
	template = require('./slope.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.mass  = Infinity;
	}

	getSlope(x, z)
	{
		const zaSlope = 1;
		const zbSlope = 1;

		this.args.z

		const tilesize = (this.args.size / 32) * this.args.d;

		return Math.max(
			0, Math.min(1, (0.5 + (this.args.z - z) / tilesize))
		);
	}
}
