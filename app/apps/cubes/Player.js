import { Cube } from './Cube';
import { Coin } from './Coin';

export class Player extends Cube
{
	coinCooldown = 0;

	constructor(args, parent)
	{
		super(args, parent);

		this.args.css = 'sean main';
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
			coin.coinCollect3.currentTime = 0;
			coin.coinCollect3.play();
		}
		else if(this.coinCooldown > 40)
		{
			coin.coinCollect2.currentTime = 0;
			coin.coinCollect2.play();
		}
		else
		{
			coin.coinCollect1.currentTime = 0;
			coin.coinCollect1.play();
		}

		this.coinCooldown += 30;

		if(this.coinCooldown > 160)
		{
			this.coinCooldown = 160;
		}
	}
}
