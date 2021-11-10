import { Database } from 'curvature/model/Database';

export class MatrixDatabase extends Database
{
	_version_1(database)
	{
		const eventStore = this.createObjectStore('events', {keyPath: 'event_id'});

		eventStore.createIndex('event_id', 'event_id', {unique: true});

		eventStore.createIndex('type', 'type', {unique: false});
		eventStore.createIndex('room_id', 'room_id', {unique: false});
		eventStore.createIndex('received', 'received', {unique: false});

		eventStore.createIndex('replyTo', ['content.sycamore.replyTo'], {unique: false});
		eventStore.createIndex('replyTo+time', ['content.sycamore.replyTo', 'received'], {unique: false});

		eventStore.createIndex('reactTo', ['content.sycamore.reactTo'], {unique: false});
		eventStore.createIndex('reactTo+time', ['content.sycamore.reactTo', 'received'], {unique: false});

		eventStore.createIndex('type+time', ['type', 'received'], {unique: false});
		eventStore.createIndex('room_id+time', ['room_id', 'received'], {unique: false});

		eventStore.createIndex('type+time+room_id', ['type', 'received', 'room_id'], {unique: false});
		eventStore.createIndex('type+room_id+time', ['type', 'room_id', 'received'], {unique: false});

		eventStore.createIndex('room_id+type+time', ['room_id', 'type', 'received'], {unique: false});
		eventStore.createIndex('room_id+time+type', ['room_id', 'received', 'type'], {unique: false});

		eventStore.createIndex('time+room_id+type', ['received', 'room_id', 'type'], {unique: false});
		eventStore.createIndex('time+type+room_id', ['received', 'type', 'room_id'], {unique: false});

	}
}
