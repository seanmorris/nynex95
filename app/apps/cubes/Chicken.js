import { Cube } from './Cube';

export class Chicken extends Cube
{
	xSpeed = 0;
	zSpeed = 0;

	constructor(args, parent)
	{
		super(args, parent);

		this.following  = false;
		this.args.size  = 64;
		this.args.css   = 'chicken';
	}

	update()
	{
		if(this.xTurnTimer > 0)
		{
			this.xTurnTimer--;
		}

		if(this.zTurnTimer > 0)
		{
			this.zTurnTimer--;
		}

		if(this.following)
		{
			let xSpeedNew = 0;
			let zSpeedNew = 0;

			if(Math.abs(this.following.args.x - this.args.x) > 4)
			{
				xSpeedNew = Math.sign(this.following.args.x - this.args.x) * 0.3;
			}
			else
			{
				xSpeedNew = 0;
			}

			if(Math.abs(this.following.args.z - this.args.z) > 4)
			{
				zSpeedNew = Math.sign(this.following.args.z - this.args.z) * 0.3;
			}
			else
			{
				zSpeedNew = 0;
			}

			if(!this.xTurnTimer)
			{
				if(Math.sign(this.xSpeed) && Math.sign(this.xSpeed) !== Math.sign(xSpeedNew))
				{
					this.xTurnTimer = 20;
				}

				this.xSpeed = xSpeedNew;
			}

			if(!this.zTurnTimer)
			{
				if(Math.sign(this.zSpeed) && Math.sign(this.zSpeed) !== Math.sign(zSpeedNew))
				{
					this.zTurnTimer = 20;
				}

				this.zSpeed = zSpeedNew;
			}

		}

		super.update();
	}

	collide(other)
	{
		if(!other.args.main)
		{
			return;
		}

		this.following = other;

		super.collide(other);
	}

	setFace(yCamTilt3d)
	{
		const chickenAngle = Math.atan2(this.zSpeed, this.xSpeed) / Math.PI;

		super.setFace(yCamTilt3d + -(chickenAngle * 100 + -100));
	}
}
