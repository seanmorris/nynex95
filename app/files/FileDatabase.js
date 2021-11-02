import { Database } from 'curvature/model/Database';

export class FileDatabase extends Database
{
	_version_1(database)
	{
		const fileStore = this.createObjectStore('files', {keyPath: 'path'});

		fileStore.createIndex('path', 'path', {unique: true});

		fileStore.createIndex('name', 'name', {unique: false});
		fileStore.createIndex('type', 'type', {unique: false});

		fileStore.createIndex('directory', 'directory', {unique: false});
	}
}
