import { Task         } from 'task/Task';
import { IconExplorer } from 'apps/iconExplorer/IconExplorer';
import { TaskManager  } from 'apps/taskManager/TaskManager';
import { RepoBrowser  } from 'apps/repoBrowser/RepoBrowser';
import { PhpEditor    } from 'apps/phpEditor/PhpEditor';
// import { Nynemark     } from 'apps/nynemark/Nynemark';
import { Nynepad      } from 'apps/nynepad/Nynepad';
import { ImageViewer  } from 'apps/imageViewer/ImageViewer';
import { Clippy       } from 'apps/clippy/Clippy';
import { GitHub       } from 'apps/gitHub/GitHub';
import { NpmUnpkgr    } from 'apps/npmUnpkgr/NpmUnpkgr';
import { Console      } from 'apps/console/Console';
// import { Drupal       } from 'apps/drupal/Drupal';
import { Numb         } from 'apps/numb/Numb';
import { WidgetViewer } from 'apps/widgetViewer/WidgetViewer';
import { Dosbox       } from 'apps/dosbox/Dosbox';
import { Letsvue      } from 'apps/letsvue/Letsvue';
import { Harp         } from 'apps/harp/Harp';
import { Game         } from 'apps/sonic-3000/Game';
import { FormTest     } from 'apps/formTest/FormTest';

import { FileBrowser  } from 'apps/fileBrowser/FileBrowser';

import { ClonesNBarrels } from 'apps/clonesNBarrels/ClonesNBarrels';

export const Path = {
	'icon-explorer':  IconExplorer
	, 'task-manager': TaskManager
	, 'nynepad':      Nynepad
	// , 'nynemark':     Nynemark
	, 'repo-browser': RepoBrowser
	, 'window':       Task
	, 'php':          PhpEditor
	, 'github':       GitHub
	// , 'npm-unpkgr':   NpmUnpkgr
	, 'clippy':       Clippy
	, 'console':      Console
	// , 'drupal':       Drupal
	, 'widgets':      WidgetViewer
	, 'clones':       ClonesNBarrels
	, 'numb':         Numb
	, 'sonic3000':    Game
	, 'file-browser': FileBrowser
	, 'image-viewer': ImageViewer
	, 'card-editor':  FormTest
	// , 'clones':       ClonesNBarrels
	// , 'dos':          Dosbox
	// , 'letsvue':      Letsvue
	// , 'harp':         Harp
};
