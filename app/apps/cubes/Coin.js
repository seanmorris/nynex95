import { Cube } from './Cube';

export class Coin extends Cube
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.size  = 64;
		this.args.css   = 'coin';
	}

	collide(other)
	{
		if(this.args.state === 'collected')
		{
			return;
		}

		this.args.state = 'collected';

		setTimeout(() => this.args.state = 'idle', 5000);
	}
}
