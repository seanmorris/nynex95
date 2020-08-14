import { Home }    from 'home/Home';
import { Window }  from 'window/Window';

document.addEventListener('DOMContentLoaded', function() {

	const tag  = document.querySelector('body');

	if(!tag)
	{
		return;
	}

	const homeView = Home.instance();

	homeView.render(tag);

	const win = new Window({content: 'Window #0.'});

	// setTimeout(()=> homeView.windows.add(win), 1000);

});
