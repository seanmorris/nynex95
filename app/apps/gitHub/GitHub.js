import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';
import { Task } from '../../task/Task';

export class GitHub extends Task
{
	title    = 'GitHub Login';
	template = require('./main.tmp');


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

		const messageListener = event => {

			GitHub.setToken(event.data);

			const token = GitHub.getToken();

			console.log(token);

			if(token.access_token)
			{
				this.trayIcon = this.trayIcon || new Icon({
					icon: 'github'
					, path: 'apps'
					, bits: 1
					, size: 16
					, action: () => {
						GitHub.setToken('{}');
						Home.instance().tray.remove(this.trayIcon);
					}
				});

				Home.instance().tray.add(this.trayIcon);

				this.trayIcon.flicker();
			}
			else
			{
				GitHub.setToken('{}');
				this.trayIcon.flicker();

				setTimeout(750, ()=>{
					Home.instance().tray.remove(this.trayIcon);
				});
			}

			this.loginWindow.close();

		};

		return new Promise((accept,reject) => {

			this.window.onTimeout(1500, () => {
				this.loginWindow = window.open(
					'https://github.com/login/oauth/authorize'
						+ '?redirect_uri=https://nynex.unholysh.it/github-auth/accept'
						+ '&client_id=7150d20fb5a11fe1d332'
						+ '&scope=public_repo'
						+ '&state=' + state
					, `github-login-${this.tid}`
					, `left=100,top=100,width=750,height=500,resizable=0,scrollbars=0,location=0,menubar=0,toolbar=0,status=0`
				);

				window.addEventListener('message', messageListener, false);

				const loop = this.window.onInterval(100, () => {
					if(!this.loginWindow.closed)
					{
						return;
					}

					clearInterval(loop);

					this.window.close();

					accept();
				});
			});

		}).finally(()=>{

			window.removeEventListener('message', messageListener, false);

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
