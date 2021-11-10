import { Bindable } from 'curvature/base/Bindable';
import { Gamepad } from 'curvature/input/Gamepad';
import { Keyboard } from 'curvature/input/Keyboard';

import { Task } from 'task/Task';

import { Cube } from './Cube';

import { Coin } from './Coin';
import { Chicken } from './Chicken';

export class Cubes extends Task
{
	static helpText = 'CUBES.';

	title    = 'Cubes 3d';
	icon     = '/apps/cube-16-1bit.png';
	template = require('./main.tmp');

	width  = "840px";
	height = "700px";

	mainCube = new Cube({css:'sean main', main: true, x:0, z: 14});

	boxCube = new Cube({css:'box', size: 256, x:-4, y: -100, z: 4});
	otherCube = new Cube({css:'barrel', x:2, y: -100, z: -6});

	mushroom = new Cube({css:'mushroom', size: 256, x:4, y: -100, z: -16});
	chicken  = new Chicken({x: 6, y: -100, z: 2, rot: 50});
	coinA     = new Coin({x: 2, y: -100, z: 10});
	coinB     = new Coin({x: 6, y: -100, z: 10});
	coinC     = new Coin({x: 10, y: -100, z: 10});
	// ian = new Cube({css:'ian', x: 10, y: -100, z: 2});

	cubes = [
		this.mainCube
		, this.otherCube
		, this.chicken
		, this.mushroom
		, this.boxCube
		, this.coinA
		, this.coinB
		, this.coinC
	];

	x3d = -2;
	y3d = -100;
	z3d = 18;

	x3dInput = -2;
	y3dInput = -100;
	z3dInput = 14;

	xCam3d = 0;
	yCam3d = 0;
	zCam3d = 0;

	xCam3dInput = 0;
	yCam3dInput = 0;
	zCam3dInput = 0;

	xCamTilt3d = 0;
	yCamTilt3d = 0;
	zCamTilt3d = 0;

	xCamTilt3dInput = -35;
	yCamTilt3dInput = -85;
	zCamTilt3dInput = 0;

	ySpeed = 0;

	cancelScroll = null;
	cancelLock   = null;

	outlines = true;

	paused = 0;
	frame  = 0;

	constructor(...a)
	{
		super(...a);

		this.window.controller = this;

		this.window.listen(document, 'pointerlockchange', event => {

			if(!document.pointerLockElement)
			{
				this.cancelLock && this.cancelLock();
				this.cancelLock = false;
				this.cancelScroll && this.cancelScroll()
				this.cancelScroll = false;
				return;
			}

			this.cancelLock = this.window.listen(
				document
				, 'mousemove'
				, event => this.mouseMoveLocked(event)
				, false
			);

			this.cancelScroll = this.window.listen(
				document
				, 'mousewheel'
				, event => this.mouseScrollLocked(event)
				, false
			);
		});

		const keys = {
			'Space': 0

			, 'KeyW': 12
			, 'KeyA': 14
			, 'KeyS': 13
			, 'KeyD': 15

			, 'ArrowUp':    12
			, 'ArrowDown':  13
			, 'ArrowLeft':  14
			, 'ArrowRight': 15
		};

		const axisMap = {
			12:   -1
			, 13: +1
			, 14: -0
			, 15: +0
		};

		const keyboard = this.keyboard = Keyboard.get();

		keyboard.listening = true;

		this.window.onRemove(() => keyboard.listening = false);

		Gamepad.getPad({keys, keyboard, index:0, deadZone: 0.25}).then(pad => {
			this.gamepad = pad;
		});

		return Bindable.make(this);
	}

	attached()
	{
		const cancel = this.window.onFrame(() => this.mainLoop());

		this.window.onRemove(cancel);
	}

	mainLoop()
	{
		this.takeInput();

		if(this.pauseThrottle > 0)
		{
			this.pauseThrottle--;
		}

		this.syncToInput('x3d');
		this.syncToInput('y3d');
		this.syncToInput('z3d');

		this.syncToInput('xCam3d');
		this.syncToInput('yCam3d');
		this.syncToInput('zCam3d');

		this.syncToInput('xCamTilt3d');
		this.syncToInput('yCamTilt3d');
		this.syncToInput('zCamTilt3d');

		if(this.paused)
		{
			if(this.paused > 0)
			{
				this.paused--;
			}

			return;
		}

		const bound = Bindable.make(this);

		bound.frame++;

		bound.outlines = this.zCam3d > -150;

		this.mainCube.args.x = this.x3d;
		this.mainCube.args.y = this.y3d;
		this.mainCube.args.z = this.z3d;

		for(const cube of this.cubes)
		{
			cube.update();
		}

		for(const cubeA of this.cubes)
		{
			let colliding = false;

			for(const cubeB of this.cubes)
			{
				if(this.checkCollision(cubeA, cubeB))
				{
					cubeA.collide(cubeB);
					colliding = true;
					break;
				}
			}

			cubeA.args.colliding = colliding;
		}

		if(this.chicken.following)
		{
			const toAngle = Math.atan2(
				this.chicken.args.z - this.chicken.following.args.z
				, this.chicken.args.x - this.chicken.following.args.x
			);

			this.chicken.rotateSprite(
				0
				, Math.cos(toAngle - this.yCamTilt3d/100)
				, Math.sin(toAngle - this.yCamTilt3d/100)
			);
		}


		this.cubes.forEach(cube => cube.setFace(this.yCamTilt3d));

	}

	checkCollision(a, b)
	{
		if(a === b)
		{
			return false;
		}

		const xMin = ((0.5 * a.args.size) + (0.5 * b.args.size)) / 32;
		const yMin = ((0.5 * a.args.size) + (0.5 * b.args.size)) / 32;
		const zMin = ((0.5 * a.args.size) + (0.5 * b.args.size)) / 32;

		if(Math.abs(a.args.x - b.args.x) > xMin)
		{
			return false;
		}

		if(Math.abs(a.args.z - b.args.z) > zMin)
		{
			return false;
		}

		if(a.args.y > b.args.y && Math.abs(a.args.y - b.args.y) > b.args.size)
		{
			return false;
		}

		if(b.args.y > a.args.y && Math.abs(a.args.y - b.args.y) > a.args.size)
		{
			return false;
		}

		return true;

		// console.log({x: a.args.x, y: a.args.y, z: a.args.z});
	}

	takeInput()
	{
		this.keyboard.update();

		if(this.keyboard.keys.o === -2 && !this.pauseThrottle)
		{
			this.paused = this.paused ? 0 : 1;
		}

		if(this.keyboard.keys.p === -2 && !this.pauseThrottle)
		{
			this.paused = this.paused ? 0 : -1;

			if(this.paused)
			{
				this.pauseThrottle = 30;
			}
		}

		if(this.paused)
		{
			return;
		}

		let xAxis = 0;
		let yAxis = 0;

		if(this.keyboard.keys.w > 0 || this.keyboard.keys.ArrowUp > 0)
		{
			yAxis = -1;
		}
		else if(this.keyboard.keys.s > 0 || this.keyboard.keys.ArrowDown > 0)
		{
			yAxis = 1;
		}

		if(this.keyboard.keys.a > 0 || this.keyboard.keys.ArrowLeft > 0)
		{
			xAxis = -1;
		}
		else if(this.keyboard.keys.d > 0 || this.keyboard.keys.ArrowRight > 0)
		{
			xAxis = 1;
		}

		if(this.keyboard.keys[' '] > 0 && this.y3d === -100)
		{
			this.ySpeed = 70;
		}

		if(this.gamepad)
		{
			this.gamepad.readInput();

			xAxis = xAxis || Number(this.gamepad.axes[0].magnitude);
			yAxis = yAxis || Number(this.gamepad.axes[1].magnitude);

			this.xCamTilt3dInput = Number(this.xCamTilt3dInput) + Number(this.gamepad.axes[3].magnitude);
			this.yCamTilt3dInput = Number(this.yCamTilt3dInput) + Number(this.gamepad.axes[2].magnitude);

			this.xCamTilt3dInput = Math.max(this.zCam3d < -150 ? -25 : -50, this.xCamTilt3dInput);
			this.xCamTilt3dInput = Math.min(this.zCam3d < -150 ? 12.5 : 0, this.xCamTilt3dInput);

			if(this.gamepad.buttons[0].delta === 1 && this.y3d === -100)
			{
				this.ySpeed = 70;
			}
		}

		this.y3d += this.ySpeed;

		if(this.y3d > -100)
		{
			this.ySpeed -= 3;
		}

		if(this.y3d <= -100)
		{
			this.y3d = -100;
		}

		this.xCamTilt3dInput = Math.max(this.zCam3d < -150 ? -25 : -50, this.xCamTilt3dInput);
		this.xCamTilt3dInput = Math.min(this.zCam3d < -150 ? 12.5 : 0, this.xCamTilt3dInput);

		if(this.yCamTilt3dInput > 100)
		{
			this.yCamTilt3dInput -= 200;
			this.yCamTilt3d -= 200;
		}

		if(this.yCamTilt3dInput < -100)
		{
			this.yCamTilt3dInput += 200;
			this.yCamTilt3d += 200;
		}

		if(this.yCam3dInput > 64)
		{
			this.yCam3dInput = 64;
		}

		if(this.zCam3dInput < -220)
		{
			this.zCam3dInput = -220;
		}

		this.mainCube.rotateSprite(this.yCamTilt3d, xAxis, yAxis);

		let rad = (this.yCamTilt3d / 100);

		const cos = Math.cos(rad * Math.PI);
		const sin = Math.sin(rad * Math.PI);

		this.x3dInput = Number(this.x3dInput) - (cos * xAxis) * 0.5;
		this.z3dInput = Number(this.z3dInput) - (sin * xAxis) * 0.5;

		this.z3dInput = Number(this.z3dInput) - (cos * yAxis) * 0.5;
		this.x3dInput = Number(this.x3dInput) + (sin * yAxis) * 0.5;
	}

	lockMouse(event)
	{
		if(this.cancelLock)
		{
			return;
		}

		event.currentTarget.requestPointerLock();
	}

	mouseMoveLocked(event)
	{
		let xMaxSpeed = 3.0;
		let yMaxSpeed = 1.5;

		if(this.zCam3d < -150)
		{
			xMaxSpeed = 0.75;
			yMaxSpeed = 0.6;
		}

		this.xCamTilt3dInput = Number(this.xCamTilt3dInput) - Math.min(xMaxSpeed, Math.abs(event.movementY)) * Math.sign(event.movementY);
		this.yCamTilt3dInput = Number(this.yCamTilt3dInput) + Math.min(yMaxSpeed, Math.abs(event.movementX)) * Math.sign(event.movementX);

		if(this.yCamTilt3dInput > 100)
		{
			this.yCamTilt3dInput -= 200;
			this.yCamTilt3d -= 200;
		}

		if(this.yCamTilt3dInput < -100)
		{
			this.yCamTilt3dInput += 200;
			this.yCamTilt3d += 200;
		}
	}

	mouseScrollLocked(event)
	{
		this.zCam3dInput += event.deltaY * 0.25;
		this.yCam3dInput += event.deltaX * 0.25;
	}

	syncToInput(property)
	{
		const bound = Bindable.make(this);

		const inputName = property + 'Input';

		bound[inputName] = Number(bound[inputName]);
		bound[property] = Number(bound[property]);

		if(Math.abs(bound[inputName] - bound[property]) > 0.001)
		{
			bound[property] += 0.23 * (bound[inputName] - bound[property]);
		}
		else
		{
			bound[property] = bound[inputName];
		}
	}
}
