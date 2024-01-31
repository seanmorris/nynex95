import { Cube } from './Cube';

export class Box extends Cube
{
	template = require('./box.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.mass  = Infinity;

		this.args.interior = this.args.interior || false;

		this.zoomStarted = false;
	}

	update()
	{
		super.update();

		if(this.parent.exterior)
		{
			if(!this.zoomStarted)
			{
				this.zoomStarted = Date.now();
			}

			this.parent.xCamTilt3dInput = -20 + (-0.5 + Math.random());
			this.parent.zCam3dInput =   250 + 25 * Math.sin((Date.now() - this.zoomStarted) / 5000);
			this.parent.yCam3dInput =  -300 + 50 * Math.cos((Date.now() - this.zoomStarted) / 250);
			this.parent.xCam3dInput *=  Math.random();
			this.parent.xCam3dInput +=  15 * (-0.5 + Math.random());
		}
	}

	collide(other)
	{
		super.collide(other);

		if(this.args.interior)
		{
			this.parent.exterior = true;

		}
	}

	leave(other)
	{
		super.leave(other);

		if(this.args.interior && this.parent.exterior)
		{
			this.zoomStarted = false;
			this.parent.exterior = false;

			setTimeout(()=>{
			},250);

			setTimeout(()=>{
				// this.parent.yCamTilt3dInput = 85;
				this.parent.zCamTilt3dInput = 0;
			},550);

			setTimeout(()=>{
				this.parent.xCamTilt3dInput = -25;
				this.parent.yCam3dInput = -64;
				this.parent.zCam3dInput = 320;
			},50);
		}
	}
}
