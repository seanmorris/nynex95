import { Cube } from './Cube';

export class Wall extends Cube
{
	template = require('./wall.tmp');

	gravity = 0;

	constructor(args, parent)
	{
		args.w = args.w || 2.000;
		args.d = args.d || 0.001;

		super(args, parent);

		this.args.css  = 'box wall';


		this.args.mass  = Infinity;
	}
}
// billboard
