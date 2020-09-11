import { Task } from 'subspace-console/Task';

const Accept = Symbol('accept');

export class PhpTask extends Task
{
	title     = 'PHP Task';
	outPrompt = '   //';
	prompt    = '<?php';

	static helpText = 'Connect to a websocket.';
	static useText  = '/connect SERVER';

	init()
	{
		const Php = require('php-wasm/PhpWeb').PhpWeb;
		const php = new Php();

		this.php = php;

		this.php.addEventListener('output', event => {
			const output = event.detail.join("\n").trim();

			if(!output.length)
			{
				return;
			}

			console.log(Number(output), output,Number(output) != output);

			if(Number(output) != output)
			{
				this.print(`"${output}"`);
			}
			else
			{
				this.print(output);
			}
		});

		this.php.addEventListener('error', event => {
			const output = event.detail.join("\n").trim();

			if(!output.length)
			{
				return;
			}

			if(Number(output) != output)
			{
				this.printErr(`"${output}"`);
			}
			else
			{
				this.printErr(output);
			}
		});

		return new Promise(accept=>{});
	}

	main(command)
	{
		this.prompt = ' ';
		return this.php.exec(command)
			.then(output => {

				if(Number(output) != output)
				{
					this.print(`"${output}"`);
				}
				else
				{
					this.print(output);
				}

			})
			.finally(() => this.prompt = '<?php');
	}
}
