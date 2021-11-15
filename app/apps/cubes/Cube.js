import { View } from 'curvature/base/View';
import { Bindable } from 'curvature/base/Bindable';

export class Cube extends View
{
	template = require('./cube.tmp');

	latestCollisions = new Set;
	collisions = new Set;

	sleeping   = false;
	noClip     = false;

	constructor(args, parent)
	{
		super(args, parent);

		this.args.size = this.args.size || 128;

		this.args.x = this.args.x || 0;
		this.args.y = this.args.y || 0;
		this.args.z = this.args.z || 0;

		this.args.w = this.args.w || 1;
		this.args.h = this.args.h || 1;
		this.args.d = this.args.d || 1;

		this.grounded = false;
		this.xSpeed   = 0;
		this.ySpeed   = 0;
		this.zSpeed   = 0;

		this.args.xAngle = 0;
		this.args.yAngle = 0;
		this.args.zAngle = 0;

		this.args.rot   = this.args.rot || 0;
		this.args.rad   = this.args.rad || 0;
		this.args.state = 'idle';
		this.args.face  = 'X';

		this.args.coinCount = 0;

		this.args.solid = this.args.solid || false;
		this.args.mass  = 1;

		this.args.id = this._id;

		this.gravity = 2.25;
	}

	updateStart(frame)
	{
		this.latestCollisions.clear();

		this.args.collided = false;

		if(this.args.y <= 0 && !this.noClip)
		{
			this.args.y = 0;
		}
	}

	takeInput(cameraAngle, input)
	{
		const xAxis = input.xAxis || 0;
		const yAxis = input.yAxis || 0;

		let rad = (cameraAngle / 100);

		const cos = Math.cos(rad * Math.PI);
		const sin = Math.sin(rad * Math.PI);

		this.xSpeed += -(cos * xAxis) * 0.125;
		this.zSpeed += -(sin * xAxis) * 0.125;
		this.zSpeed += -(cos * yAxis) * 0.125;
		this.xSpeed += +(sin * yAxis) * 0.125;

		if(input.b[0])
		{
			// console.log(this.ySpeed);
		}

		if(input.b[0] && this.grounded)
		{
			// this.ySpeed = 35;
			this.ySpeed = 34;
		}
	}

	update(frame)
	{
		if(this.args.collided)
		{
			this.args.colliding = true;
		}
		else
		{
			this.args.colliding = false;
		}

		this.args.x += this.xSpeed;
		this.args.y += this.ySpeed;
		this.args.z += this.zSpeed;

		this.args.x = Number(Number(this.args.x).toFixed(3));
		this.args.y = Number(Number(this.args.y).toFixed(3));
		this.args.z = Number(Number(this.args.z).toFixed(3));

		this.xSpeed *= 0.75;
		this.zSpeed *= 0.75;

		if(this.args.y <= 0 && !this.noClip)
		{
			this.args.y = 0;
			this.ySpeed = 0;

			this.grounded = true;
		}
		else
		{
			this.ySpeed -= this.gravity;
		}

		for(const cube of this.collisions)
		{
			if(!this.latestCollisions.has(cube))
			{
				this.leave(cube);
			}
		}

		for(const cube of this.latestCollisions)
		{
			this.collisions.add(cube);
		}
	}

	collide(other)
	{
		this.latestCollisions.add(other);
		this.args.collided = true;
	}

	leave(other)
	{}

	checkCollision(b)
	{
		const a = this;

		if(a === b)
		{
			return false;
		}

		if(a.args.solid && b.args.solid)
		{
			return false;
		}

		const wiggleRoom = Number.EPSILON * 4.001;

		const xMin  = (0.5 * (a.args.size * a.args.w + b.args.size * b.args.w)) / 32;
		const xDist = a.args.x - b.args.x;

		if(Math.abs(xDist) + -wiggleRoom > xMin)
		{
			return false;
		}

		const zMin  = (0.5 * (a.args.size  * a.args.d + b.args.size * b.args.d)) / 32;
		const zDist = a.args.z - b.args.z;

		if(Math.abs(zDist) + -wiggleRoom > zMin)
		{
			return false;
		}

		const zbSlope = b.getSlope(a.args.x, a.args.z);
		const zaSlope = a.getSlope(b.args.x, b.args.z);

		const yDist = a.args.y - b.args.y;

		if(a.args.y > b.args.y && Math.abs(a.args.y - b.args.y) > b.args.size * zbSlope)
		{
			return false;
		}

		if(b.args.y > a.args.y && Math.abs(a.args.y - b.args.y) > a.args.size * zaSlope)
		{
			return false;
		}

		if(a.args.solid)
		{
			const top = a.args.size * zaSlope;

			if(-(a.args.size/2) + yDist < -top
				&& Math.abs(xDist) + wiggleRoom < xMin
				&& Math.abs(zDist) + wiggleRoom < zMin
			){
				b.args.y = a.args.y + top;

				b.ySpeed = b.ySpeed > 0
					? b.ySpeed
					: 0;

				if(!b.ySpeed)
				{
					b.grounded = true;
				}
			}
			else if(Math.abs(xDist / this.args.w) > Math.abs(zDist / this.args.d))
			{
				b.args.x = a.args.x - xMin * Math.sign(xDist);
				b.xSpeed = Math.sign(b.xSpeed) !== Math.sign(xDist)
					? b.xSpeed
					: 0;
			}
			else
			{
				b.args.z = a.args.z - zMin * Math.sign(zDist);
				b.zSpeed = Math.sign(b.zSpeed) !== Math.sign(zDist)
					? b.zSpeed
					: 0;
			}
		}

		return true;
	}

	getSlope(x, z)
	{
		return 1;
	}

	rotateSprite(yCamTilt3d, xAxis, yAxis)
	{
		let rad = (yCamTilt3d / 100);
		let rot = 0;

		const cos = Math.cos(rad * Math.PI);
		const sin = Math.sin(rad * Math.PI);

		if(yAxis > 0)
		{
			rot += Math.sign(yAxis);
		}

		if(xAxis)
		{
			rot += -Math.sign(yAxis||-1) * (Math.sign(Math.abs(xAxis) > Math.abs(yAxis) ? xAxis : 0)) / 2;
		}

		if(rot > 1)
		{
			rot -= 2;
		}

		if(rot < -1)
		{
			rot += 2;
		}

		if(xAxis || yAxis)
		{
			this.args.rad = (rot + rad) * Math.PI;
			this.args.rot = rot * 100 + yCamTilt3d;

			this.args.walking = true;

			this.setFace(yCamTilt3d);
		}
		else
		{
			this.args.walking = false;
		}
	}

	setFace(cameraAngle)
	{
		let v = cameraAngle + -this.args.rot;

		if(v > 100)
		{
			v -= 200;
		}

		if(v < -100)
		{
			v += 200;
		}

		let face;

		if(v >= 75 || v <= -75)
		{
			face = 'front';
		}
		else if(v > 25)
		{
			face = 'left';
		}
		else if(v < -25)
		{
			face = 'right';
		}
		else
		{
			face = 'back';
		}

		this.args.face = face;
	}
}
