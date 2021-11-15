const CellRef = Symbol('CellRef');

class Box
{
	position = {};
	size = {};

	constructor(position = {x:0,y:0,z:0}, size = {x:0,y:0,z:0})
	{
		this.position.x = position.x;
		this.position.y = position.y;
		this.position.z = position.z;

		this.size.x = size.x;
		this.size.y = size.y;
		this.size.z = size.z;

		Object.seal(this);
	}

	contains(point = {x: 0, y: 0, z: 0})
	{
		const xMin = this.position.x - this.size.x / 2;
		const xMax = this.position.x + this.size.x / 2;

		if(point.x < xMin || point.x > xMax)
		{
			return false;
		}

		const yMin = this.position.y - this.size.y / 2;
		const yMax = this.position.y + this.size.y / 2;

		if(point.y < yMin || point.y > yMax)
		{
			return false;
		}

		const zMin = this.position.z - this.size.z / 2;
		const zMax = this.position.z + this.size.z / 2;

		if(point.z < zMin || point.z > zMax)
		{
			return false;
		}

		return true;
	}
}

export class OctCell
{
	position = {};
	size = {};

	divided = false;
	parent = null;

	leafPoint = {x:null, y:null, z:null};
	leafRef   = null;

	ldf = null;
	rdf = null;
	luf = null;
	ruf = null;
	ldb = null;
	rdb = null;
	lub = null;
	rub = null;

	cells = [];

	constructor(position = {x:0,y:0,z:0}, size = {x:0,y:0,z:0}, parent = null)
	{
		this.box = new Box(position, size);
		this.parent = parent;

		Object.seal(this);
	}

	empty()
	{
		if(!this.divided)
		{
			return !this.leafRef;
		}

		for(const cell of this.cells)
		{
			if(!cell.empty())
			{
				return false;
			}
		}

		return true;
	}

	insert(object, point = {x:0, y:0, z: 0})
	{
		if(!this.contains(point))
		{
			return false;
		}

		if(!this.leafRef && !this.divided)
		{
			this.leafPoint.x = point.x;
			this.leafPoint.y = point.y;
			this.leafPoint.z = point.z;

			this.leafRef = object;

			this.leafRef[CellRef] = this;

			// console.log(object, this);

			return true;
		}
		else if(!this.divided)
		{
			this.divide();
		}

		for(const cell of this.cells)
		{
			if(cell.insert(object, point))
			{
				return true;
			}
		}

		return false;
	}

	move(object, point)
	{
		const cell = object[CellRef];

		if(cell)
		{
			if(cell.leafPoint.x === point.x
				&& cell.leafPoint.y === point.y
				&& cell.leafPoint.z === point.z
			){
				return;
			}

			object[CellRef] = null;

			cell.leafRef = null;

			if(cell.parent)
			{
				cell.parent.join();
			}
		}

		this.insert(object, point);
	}

	remove(object)
	{
		const cell = object[CellRef];

		if(!cell)
		{
			return;
		}

		object[CellRef] = null;

		cell.leafRef = null;

		if(cell.parent)
		{
			cell.parent.join();
		}
	}

	join()
	{
		if(!this.empty())
		{
			return false;
		}

		let nonEmpty = null;

		for(const cell of this.cells)
		{
			if(!cell.empty())
			{
				if(nonEmpty)
				{
					return false;
				}

				nonEmpty = cell;
			}
		}

		this.ldf = null;
		this.rdf = null;
		this.luf = null;
		this.ruf = null;
		this.ldb = null;
		this.rdb = null;
		this.lub = null;
		this.rub = null;

		this.cells = [];

		this.divided = false;

		if(nonEmpty)
		{
			this.insert(nonEmpty.leafRef);
		}

		if(this.parent)
		{
			this.parent.join();
		}
	}

	divide()
	{
		if(this.divided)
		{
			return false;
		}

		const p = this.box.position;
		const s = this.box.size;

		this.ldf = new this.constructor({x:p.x - s.x/4, y:p.y - s.y/4, z:p.z + s.z/4}, {x:s.x/2, y:s.y/2, z:s.z/2}, this);
		this.rdf = new this.constructor({x:p.x + s.x/4, y:p.y - s.y/4, z:p.z + s.z/4}, {x:s.x/2, y:s.y/2, z:s.z/2}, this);
		this.luf = new this.constructor({x:p.x - s.x/4, y:p.y + s.y/4, z:p.z + s.z/4}, {x:s.x/2, y:s.y/2, z:s.z/2}, this);
		this.ruf = new this.constructor({x:p.x + s.x/4, y:p.y + s.y/4, z:p.z + s.z/4}, {x:s.x/2, y:s.y/2, z:s.z/2}, this);
		this.ldb = new this.constructor({x:p.x - s.x/4, y:p.y - s.y/4, z:p.z - s.z/4}, {x:s.x/2, y:s.y/2, z:s.z/2}, this);
		this.rdb = new this.constructor({x:p.x + s.x/4, y:p.y - s.y/4, z:p.z - s.z/4}, {x:s.x/2, y:s.y/2, z:s.z/2}, this);
		this.lub = new this.constructor({x:p.x - s.x/4, y:p.y + s.y/4, z:p.z - s.z/4}, {x:s.x/2, y:s.y/2, z:s.z/2}, this);
		this.rub = new this.constructor({x:p.x + s.x/4, y:p.y + s.y/4, z:p.z - s.z/4}, {x:s.x/2, y:s.y/2, z:s.z/2}, this);

        this.cells.push(
        	this.ldf, this.rdf
        	, this.luf, this.ruf
        	, this.ldb, this.rdb
        	, this.lub, this.rub
        );

        this.divided = true;

        if(!this.leafRef)
		{
			return true;
		}

		for(const cell of this.cells)
		{
			const inserted = cell.insert(this.leafRef, this.leafPoint);

			if(inserted)
			{
				this.leafRef = null;

				return true;
			}
		}
	}

	contains(point = {x: 0, y: 0, z: 0})
	{
		return this.box.contains(point);
	}

	select(position = {x:0,y:0,z:0}, size = {x:0,y:0,z:0})
	{
		if(this.empty())
		{
			return [];
		}

		const xMax = size.x / 2 + this.box.size.x / 2;

		if(xMax < Math.abs(position.x - this.box.position.x))
		{
			return [];
		}

		const yMax = size.y / 2 + this.box.size.y / 2;

		if(yMax < Math.abs(position.y - this.box.position.y))
		{
			return [];
		}

		const zMax = size.z / 2 + this.box.size.z / 2;

		if(zMax < Math.abs(position.z - this.box.position.z))
		{
			return [];
		}

		if(this.divided)
		{
			return this.cells.map(c => c.select(position, size)).flat();
		}

		return this.leafRef ? [ this.leafRef ] : [];
	}
}
