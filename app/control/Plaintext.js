import { View } from 'curvature/base/View';

import { Home } from '../home/Home';

import * as ace from 'brace';

import 'brace/mode/php';
import 'brace/mode/html';
import 'brace/mode/yaml';
import 'brace/mode/markdown';
import 'brace/mode/javascript';
import 'brace/theme/monokai';

console.log(ace);

export class Plaintext extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		console.log(args);

		this.template  = require('./plaintext.tmp');
	}

	attached()
	{
		let mode = false;

		switch(this.args.filetype)
		{
			case 'html': mode = 'ace/mode/html'; break;
			case 'yml':  mode = 'ace/mode/yaml'; break;
			case 'lua':  mode = 'ace/mode/lua'; break;
			case 'css':  mode = 'ace/mode/css'; break;
			case 'php':  mode = 'ace/mode/php'; break;
			case 'js':   mode = 'ace/mode/javascript'; break;
			case 'md':   mode = 'ace/mode/markdown'; break;
		}

		let editor = ace.edit(this.findTag('textarea'));

		editor.setTheme('ace/theme/monokai');

		if(mode)
		{
			editor.session.setMode(mode);
		}

		const aceChanged = (event) => {
			this.args.content = editor.session.getValue();
		};

		editor.session.on('change', aceChanged);

		editor.setOptions({
			autoScrollEditorIntoView: true
			, maxLines:               0
			, printMargin:            false
			, readOnly:               false
		});

		this.onRemove(()=>{
			editor.session.off('change', aceChanged);
			editor.container.remove();
			editor.destroy();
		});

	}
}
