import './style.css';
import { Game } from './core/game';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) {
  throw new Error('Root element missing');
}

const game = new Game();
void game.boot(root);
