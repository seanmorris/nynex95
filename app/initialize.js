import { Home }    from 'home/Home';
import { Window }  from 'window/Window';

import { Router }  from 'curvature/base/Router';

import { punycode }  from 'punycode';

const homeView = Home.instance();

document.addEventListener('DOMContentLoaded', function() {

	if(location.pathname === '/satellite-window')
	{
		return;
	}

	Router.listen(homeView);

	homeView.render(document.body);
});
