import { Cube } from './Cube';
import { Barrel } from './Barrel';

export class BarrelHole extends Cube
{
	template = require('./barrel-hole.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.css = 'barrel-hole';

		this.eating = null;

		this.started = false;

		this.dropping = false;
	}

	update(frame)
	{
		super.update(frame);

		if(this.eating)
		{
			this.args.css = 'barrel-hole open';
		}

		if(this.eating && this.started)
		{
			this.eating.args.x = this.args.x + 0.01;
			this.eating.args.z = this.args.z + 0.01;

			this.eating.noClip = true;
			this.eating.ySpeed = 0;

			this.eating.args.y -= 1;
		}

		if(this.eating && this.eating.args.y < this.args.y - 128)
		{
			this.args.css = 'barrel-hole closed';
			this.eating.sleeping = true;

			this.eating = null;

			this.dropping = true;
		}

		if(this.dropping && this.args.targets)
		{
			this.args.targets.forEach(t => {
				if(t.args.y < -1024)
				{
					this.dropping = false;
					return;
				}
				t.noClip = true;
				t.args.y -= 5;
			})
		}
	}

	collide(other)
	{
		if(other === this.eating)
		{
			return;
		}

		if(other instanceof Barrel)
		{
			this.eating = other;

			setTimeout(() => this.started = true, 200);

			this.eating.args.x = this.args.x + 0.01;
			this.eating.args.y = this.args.y + 0.01;
			this.eating.args.z = this.args.z + 0.01;
		}

		return super.collide(other);
	}

}
