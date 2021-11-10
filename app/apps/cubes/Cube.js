import { View } from 'curvature/base/View';

export class Cube extends View
{
	template = require('./cube.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.size = this.args.size || 128;

		this.args.x = this.args.x || 0;
		this.args.y = this.args.y || 0;
		this.args.z = this.args.z || 0;

		this.args.xAngle = 0;
		this.args.yAngle = 0;
		this.args.zAngle = 0;

		this.args.rot   = this.args.rot || 0;
		this.args.rad   = this.args.rad || 0;
		this.args.state = 'idle';
		this.args.face  = 'X';
	}

	update(frame)
	{}

	collide(other)
	{}

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
