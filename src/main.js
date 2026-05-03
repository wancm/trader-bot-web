import './md-bootstrap.js';
import '@material/web/icon/icon.js';
import { mountNav } from './ui/nav.js';

mountNav(document.getElementById('app-nav'), { active: 'home' });
