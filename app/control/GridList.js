import { View } from 'curvature/base/View';
import { Bag } from 'curvature/base/Bag';

class GridRow extends View
{
	template = require('./grid-row.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.headers = this.args.headers || [];
		this.args.record = this.args.record   || {};

		this.args.cells = [];

		const debind = this.args.headers.bindTo((v,k,t,d) => {
			this.args.cells[ k ] = String(this.args.record[ this.args.headers[k] ] ?? '');
		}, {wait:0});

		this.onRemove(debind);

		for(const k in this.args.headers)
		{
			this.args.cells[ k ] = this.args.record[ this.args.headers[k] ] || '';
		}
	}
}

class GridCard extends View
{
	template = require('./grid-card.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.records = new Bag;

		this.args.headers = this.args.headers || [];

		//*/
		this.args.headers = ["room", "unread"];
		/*/
		this.onTimeout(1000, () => this.args.headers.push('class'));
		this.onTimeout(1500, () => this.args.headers.push('star'));
		this.onTimeout(2500, () => this.args.headers.push('end'));
		// this.onTimeout(3500, () => this.args.headers.push('content'));
		//*/

		const debind = this.args.headers.bindTo((v,k,t,d) => {
			this.args.columns = this.args.headers.length;
		},{wait:0});

		this.args.rows = this.records.map(record => {
			return new GridRow({record,headers:this.args.headers});
		});
	}
}

export class GridList extends View
{
	template = require('./grid-list.tmp');

	constructor(args, parent)
	{
		super(args, parent);

		this.records = new Bag();

		this.args.cards = this.records.map(record =>
			new GridCard({room: record.room, unread: record.unread}, this)
		);
	}
}
