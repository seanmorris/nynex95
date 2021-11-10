// import { Model } from 'curvature/model/Model';
// import { MessageDatabase } from './EventDatabase';

// export class MatrixEvent extends Model
// {
// 	static get keyProps() { return ['event_id', 'class'] }

// 	event_id;
// 	type;
// 	room_id;
// 	content;
// 	received;
// 	origin_server_ts;

// 	consume(...args)
// 	{
// 		super.consume(...args);

// 		this.received = this.origin_server_ts || Date.now();
// 	}
// }
