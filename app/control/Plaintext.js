import { View } from 'curvature/base/View';

import { Home } from '../home/Home';

import * as ace from 'brace';

import 'brace/mode/php';
import 'brace/mode/html';
import 'brace/mode/yaml';
import 'brace/mode/markdown';
import 'brace/mode/javascript';
import 'brace/theme/monokai';

export class Plaintext extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./plaintext.tmp');
	}

	rendered()
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

		editor.session.setOption("wrap", true);

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

		editor.$blockScrolling = Infinity;

		this.onRemove(()=>{
			editor.session.off('change', aceChanged);
			editor.container.remove();
			editor.destroy();
		});

		this.args.bindTo('content', v => {

			if(!editor.isFocused() && editor.getValue() !== v)
			{
				editor.setValue(v || '');
				editor.clearSelection();
			}
		});

		this.editor = editor;
	}

	resize()
	{
		this.onNextFrame(()=>{
			this.editor && this.editor.resize();
		});
	}
}
