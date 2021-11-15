import { Cube } from './Cube';

export class Barrel extends Cube
{
	template = require('./cube.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.css   = 'barrel';
	}

	collide(other)
	{
		if(other.args.solid)
		{
			return;
		}

		if(!other.xSpeed && !other.zSpeed)
		{
			return;
		}

		const xMin = 0.5 * (this.args.size + other.args.size) / 32;
		const zMin = 0.5 * (this.args.size + other.args.size) / 32;

		const angle = Math.atan2(this.args.z - other.args.z, this.args.x - other.args.x);

		if(xMin > Math.abs(this.args.x - other.args.x) && Math.sign(this.args.x - other.args.x) === Math.sign(other.xSpeed))
		{
			this.args.x = other.args.x + (1.01 * xMin * Math.cos(angle)) + other.xSpeed;
		}

		if(zMin > Math.abs(this.args.z - other.args.z) && Math.sign(this.args.z - other.args.z) === Math.sign(other.zSpeed))
		{
			this.args.z = other.args.z + (1.01 *zMin * Math.sin(angle)) + other.zSpeed;
		}

	}
}
