import { Cube } from './Cube';
import { Coin } from './Coin';

export class Player extends Cube
{
	coinCooldown = 0;

	constructor(args, parent)
	{
		super(args, parent);

		this.args.css = 'sean main';

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

	update(frame)
	{
		super.update(frame);

		this.coinCooldown = Math.max(0, -1 + this.coinCooldown);
	}

	collide(other)
	{
		super.collide(other);

		if(other instanceof Coin && !other.args.gone)
		{

		}
	}

	collect(coin)
	{
		if(this.coinCooldown >= 75)
		{
			this.coinCollect3.currentTime = 0;
			this.coinCollect3.play();
		}
		else if(this.coinCooldown > 40)
		{
			this.coinCollect2.currentTime = 0;
			this.coinCollect2.play();
		}
		else
		{
			this.coinCollect1.currentTime = 0;
			this.coinCollect1.play();
		}

		this.coinCooldown += 30;

		if(this.coinCooldown > 160)
		{
			this.coinCooldown = 160;
		}
	}
}
