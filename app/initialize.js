import { Home }    from 'home/Home';
import { Window }  from 'window/Window';

import { Router }  from 'curvature/base/Router';

const homeView = Home.instance();

document.addEventListener('DOMContentLoaded', function() {

	Router.listen(homeView);

	const tag  = document.querySelector('body');

	if(!tag)
	{
		return;
	}

	homeView.render(tag);

	// const win = new Window({content: 'Window #0.'});


	// setTimeout(()=> homeView.windows.add(win), 1000);

});
