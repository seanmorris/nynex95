import { Task } from '../../task/Task';

export class GitHub extends Task
{
	title = 'GitHub Login';

	static setToken(token)
	{
		sessionStorage.setItem('github-access-token', token);
	}

	static getToken()
	{
		const source = sessionStorage.getItem('github-access-token');

		return source
			? JSON.parse(source)
			: false;
	}

	execute()
	{
		const state = ( Math.random() ).toString(36);

		return new Promise(() => {

			this.loginWindow = window.open(
				'https://github.com/login/oauth/authorize'
					+ '?redirect_uri=https://nynex.unholysh.it/github-auth/accept'
					+ '&client_id=7150d20fb5a11fe1d332'
					+ '&scope=public_repo'
					+ '&state=' + state
				, `github-login-${this.tid}`
				, `left=100,top=100,width=750,height=500,resizable=0,scrollbars=0,location=0,menubar=0,toolbar=0,status=0`
			);

			window.addEventListener('message', event => {

				console.log(event.data);
				GitHub.setToken(event.data);

				this.loginWindow.close();

			}, false);

			const loop = this.window.onInterval(100, () => {
				if(!this.loginWindow.closed)
				{
					return;
				}

				clearInterval(loop);

				this.window.close();
			});
		});
	}

	signal(event)
	{
		switch(event.type)
		{
			case 'kill':
			case 'closed':

				this.loginWindow.close();
				break;
		}

		super.signal(event);
	}
}
