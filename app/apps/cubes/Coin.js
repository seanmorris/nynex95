import { Cube } from './Cube';

export class Coin extends Cube
{
	template = require('./coin.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.size  = 64;
		this.args.css   = 'coin';

		this.coinCollect1 = new Audio('/coin1.wav');
		this.coinCollect2 = new Audio('/coin2.wav');
		this.coinCollect3 = new Audio('/coin3.wav');

		this.coinCollect1.currentTime = 0;
		this.coinCollect2.currentTime = 0;
		this.coinCollect3.currentTime = 0;

		this.coinCollect1.volume = 0.40;
		this.coinCollect2.volume = 0.30;
		this.coinCollect3.volume = 0.25;
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
