import { Cube } from './Cube';

export class Coin extends Cube
{
	template = require('./coin.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.size  = 64;
		this.args.css   = 'coin';
	}

	collide(other)
	{
		if(other.args.solid)
		{
			return super.collide(other);
		}

		if(this.args.state === 'collected')
		{
			return;
		}

		if('coinCount' in other.args)
		{
			other.args.coinCount++;
		}

		this.args.gone = true;

		other.collect && other.collect(this);

		requestAnimationFrame(() => {
			this.args.state = 'collected';
		});

		setTimeout(() => this.args.state = 'idle', 5000);
		setTimeout(() => this.args.gone  = false,  5150);

		return super.collide(other);
	}
}
