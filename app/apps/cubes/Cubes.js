import { Bindable } from 'curvature/base/Bindable';
import { Gamepad } from 'curvature/input/Gamepad';
import { Keyboard } from 'curvature/input/Keyboard';

import { Task } from 'task/Task';

import { Cube } from './Cube';

import { Box }     from './Box';
import { Wall }    from './Wall';
import { Slope }   from './Slope';

import { Barrel }  from './Barrel';
import { BarrelHole }  from './BarrelHole';

import { Coin }    from './Coin';
import { Chicken } from './Chicken';

import { Player } from './Player';

import { OctCell } from './OctCell';

export class Cubes extends Task
{
	static helpText = 'CUBES.';

	template = require('./main.tmp');

	title    = 'Cubes 3d';
	icon     = '/apps/cube-16-1bit.png';

	exterior = false

	width  = "840px";
	height = "740px";

	mainCube = new Player({css:'sean main', main: true, x: -12, y: 512, z: 12}, this);

	cubes = [
		this.mainCube
		, new Barrel({css:'barrel', x:  1, y: 512*4, z:  16}, this)
		, new BarrelHole({css:'barrel-hole', x: -4, y: 0, z: 12}, this)

		, new Coin({css:'coin', x: -20, y: 4096, z: -16}, this)
		, new Coin({css:'coin', x: -20, y: 4096, z: -12}, this)
		, new Coin({css:'coin', x: -20, y: 4096, z: -8}, this)

		, new Coin({css:'coin', x: -16, y: 4096, z: -16}, this)
		, new Coin({css:'coin', x: -16, y: 4096, z: -12}, this)
		, new Coin({css:'coin', x: -16, y: 4096, z: -8}, this)

		, new Coin({css:'coin', x: -12, y: 4096, z: -16}, this)
		, new Coin({css:'coin', x: -12, y: 4096, z: -12}, this)
		, new Coin({css:'coin', x: -12, y: 4096, z: -8}, this)

		, new Coin({css:'coin', x: -36, y: 4096, z: 24}, this)
		, new Coin({css:'coin', x: -36, y: 4096, z: 28}, this)
		, new Coin({css:'coin', x: -36, y: 4096, z: 32}, this)

		, new Wall({css:'box', solid: true, size: 512, x: -24, y: 512, z: -20, w: 4, billboard: 'MIDDLE CLICK to\ntoggle mouselook'}, this)
		, new Wall({css:'box', solid: true, size: 512, x: -8, y: 0, z: -4, w: 2, billboard: 'Move with WASD'}, this)

		, new Wall({css:'box', solid: true, size: 512, x: -40, y: 0, z: -20, billboard: 'Press SPACE to jump'}, this)
		, new Wall({css:'box', solid: true, size: 512, x: 26, y: 0, z: -40, w: 3}, this)

		, new Wall({css:'box', solid: true, size: 512, x: 16, y: 0, z: -16, w: 0.001, d: 3}, this)

		, new Wall({css:'box', solid: true, size: 512, x: 16, y: 0, z: 34, w: 0.001, d: 2}, this)

		, new Wall({css:'box', solid: true, size: 512, x: 50, y: 0, z: -8, w: 0.001, d: 4}, this)
		, new Wall({css:'box', solid: true, size: 512, x: -50, y: 0, z: -8, w: 0.001, d: 4}, this)

		, new Box({css:'box', solid: true, size: 512, x:  8, y: 0, z:  12}, this)
		, new Box({css:'box', solid: true, size: 512, x:  0, y: 0, z: -12}, this)
		, new Box({css:'box', solid: true, size: 512, x:-16, y: 0, z: -12}, this)

		, new Box({css:'box', solid: true, size: 256, x:-20, y: 0, z:  4}, this)

		, new Box({css:'box', solid: false, interior: true, size: 512, x:30, y: 0, z: -30}, this)

		, new Slope({css:'box', solid: true, size: 512, x:-36, y: 0, z: 28}, this)
		, new Box({css:'box landing', solid: true, size: 512, x:-36, y: 0, z: 4}, this)

		, new Cube({css:'mushroom', size: 256, x:44, y: 4096*2, z: -28}, this)
		, new Chicken({x:-0, y: 512*5, z: -12, rot: 50}, this)
		// , this.otherCube
		// , this.mushroom
	];

	x3d = -2;
	y3d = 0;
	z3d = 18;

	x3dInput = -2;
	y3dInput = 0;
	z3dInput = 18;

	xCam3d = 0;
	yCam3d = -64;
	zCam3d = 240;

	xCam3dInput = 0;
	yCam3dInput = -64;
	zCam3dInput = 320;

	xCamTilt3d = -25;
	yCamTilt3d = 75;
	zCamTilt3d = 0;

	xCamTilt3dInput = -35;
	yCamTilt3dInput = -75;
	zCamTilt3dInput = 0;

	cancelScroll = null;
	cancelLock   = null;

	outlines = true;

	paused = 0;
	frame  = 0;

	lockThrottle = 0;

	octCell = new OctCell({x:0, y: 0, z: 0}, {x:100, y:3200, z:100});

	constructor(...a)
	{
		super(...a);

		this.window.classes.maximized = true;

		// window.octCell = this.octCell;

		// this.mainCube.args.bindTo('z', v => console.trace(v));

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

		Gamepad.getPad({keys, keyboard, index:0, deadZone: 0.175}).then(pad => {
			this.gamepad = pad;
		});

		for(let i = 0; i < 6; i += 1)
		{
			for(let j = 0; j < 6; j += 1)
			{
				const position = {x: 26 + j * 4, y: 0, z: 10 + i * 4}
				const coin = new Coin(position);
				this.cubes.push(coin);
			}
		}

		for(const cube of this.cubes)
		{
			const position = {x:cube.args.x, y:cube.args.y, z:cube.args.z};

			this.octCell.insert(Bindable.make(cube), position);
		}

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

		if(this.paused > 1)
		{
			this.paused--;
		}
		else if(this.paused)
		{
			this.syncToInput('xCam3d');
			this.syncToInput('yCam3d');
			this.syncToInput('zCam3d');

			this.syncToInput('xCamTilt3d');
			this.syncToInput('yCamTilt3d');
			this.syncToInput('zCamTilt3d');
			return;
		}

		const bound = Bindable.make(this);

		bound.frame++;

		bound.outlines = this.zCam3d > -150;

		bound.coinCount = this.mainCube.args.coinCount;

		for(const cube of this.cubes)
		{
			if(cube.sleeping)
			{
				continue;
			}

			cube.updateStart();
		}

		for(const cubeA of this.cubes)
		{
			if(cubeA.sleeping)
			{
				continue;
			}

			const position = {x:cubeA.args.x, y:cubeA.args.y, z:cubeA.args.z};
			const size     = {
				x:cubeA.args.size / 8
				, y:cubeA.args.size * 8
				, z:cubeA.args.size / 8
			};

			const others = this.octCell.select(position, size);

			let colliding = false;

			for(const cubeB of others)
			{
				if(cubeB.sleeping)
				{
					continue;
				}

				if(cubeA.checkCollision(cubeB))
				{
					cubeB.collide(cubeA);

					if(cubeA.args.solid)
					{
						colliding = true;
					}
				}
			}

			if(!colliding)
			{
				cubeA.grounded = false;
			}
		}

		for(const cube of this.cubes)
		{
			if(cube.sleeping)
			{
				continue;
			}

			cube.update();

			cube.setFace(this.yCamTilt3d)
		}

		for(const cube of this.cubes)
		{
			if(cube.sleeping)
			{
				continue;
			}

			this.octCell.move(cube, {
				x: cube.args.x
				, y: cube.args.y
				, z: cube.args.z
			});
		}

		bound.x3d = Number(this.mainCube.args.x).toFixed(3);
		bound.y3d = Number(this.mainCube.args.y).toFixed(3);
		bound.z3d = Number(this.mainCube.args.z).toFixed(3);

		this.syncToInput('xCam3d');
		this.syncToInput('yCam3d');
		this.syncToInput('zCam3d');

		this.syncToInput('xCamTilt3d');
		this.syncToInput('yCamTilt3d');
		this.syncToInput('zCamTilt3d');
	}

	takeInput()
	{
		this.keyboard.update();

		if(this.keyboard.keys.o === -2 && !this.pauseThrottle)
		{
			this.paused = this.paused ? 2 : -1;
		}

		if(this.keyboard.keys.p === -2 && !this.pauseThrottle)
		{
			this.paused = this.paused ? 0 : -1;

			if(this.paused)
			{
				this.pauseThrottle = 30;
			}
		}

		const input = {xAxis: 0, yAxis: 0, aAxis: 0, bAxis:0, b: []};

		if(this.keyboard.keys.w > 0 || this.keyboard.keys.ArrowUp > 0)
		{
			input.yAxis = -1;
		}
		else if(this.keyboard.keys.s > 0 || this.keyboard.keys.ArrowDown > 0)
		{
			input.yAxis = 1;
		}

		if(this.keyboard.keys.a > 0 || this.keyboard.keys.ArrowLeft > 0)
		{
			input.xAxis = -1;
		}
		else if(this.keyboard.keys.d > 0 || this.keyboard.keys.ArrowRight > 0)
		{
			input.xAxis = 1;
		}

		if(this.keyboard.keys[' '] > 0)
		{
			input.b[0] = 1;
		}

		if(this.gamepad)
		{
			this.gamepad.readInput();

			input.xAxis = input.xAxis || Number(this.gamepad.axes[0].magnitude);
			input.yAxis = input.yAxis || Number(this.gamepad.axes[1].magnitude);

			input.aAxis = input.aAxis || Number(this.gamepad.axes[2].magnitude);
			input.bAxis = input.bAxis || Number(this.gamepad.axes[3].magnitude);

			for(const i in this.gamepad.buttons)
			{
				input.b[i] = this.gamepad.buttons[i].delta;
			}
		}

		this.tiltCamera(input);

		this.mainCube.takeInput(this.yCamTilt3d, input);

		this.mainCube.rotateSprite(this.yCamTilt3d, input.xAxis, input.yAxis);
	}

	tiltCamera(input)
	{
		this.xCamTilt3dInput = Number(this.xCamTilt3dInput) + input.aAxis;
		this.yCamTilt3dInput = Number(this.yCamTilt3dInput) + input.bAxis;

		this.xCamTilt3dInput = Math.max(this.zCam3d < -150 ? -25 : -50, this.xCamTilt3dInput);
		this.xCamTilt3dInput = Math.min(this.zCam3d < -150 ? 25 : 0, this.xCamTilt3dInput);

		this.xCamTilt3dInput = Math.max(this.zCam3d < -150 ? -25 : -50, this.xCamTilt3dInput);
		this.xCamTilt3dInput = Math.min(this.zCam3d < -150 ? 25 : 0, this.xCamTilt3dInput);

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
	}

	lockMouse(event)
	{
		console.log(event);

		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();

		if(Date.now() - this.lockThrottle < 350)
		{
			return;
		}

		this.lockThrottle = Date.now();

		if(event.which !== 2)
		{
			return;
		}

		if(document.pointerLockElement)
		{
			document.exitPointerLock();
		}
		else
		{
			event.currentTarget.requestPointerLock();
		}
	}

	mouseMoveLocked(event)
	{
		let xMaxSpeed = 4.0;
		let yMaxSpeed = 2.5;

		if(this.zCam3d < -150)
		{
			xMaxSpeed = 0.95;
			yMaxSpeed = 1;
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
			bound[property] += 0.27 * (bound[inputName] - bound[property]);
		}
		else
		{
			bound[property] = bound[inputName];
		}
	}
}
