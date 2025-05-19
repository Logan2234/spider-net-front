import { writable, type Subscriber } from 'svelte/store';

let timeout: NodeJS.Timeout;
const scrolling = writable(false);

const scrollingOn = () => {
  clearTimeout(timeout);
  scrolling.set(true);
  timeout = setTimeout(() => {
    scrolling.set(false);
  }, 50);
};

const subscribeScrolling = (run: Subscriber<boolean>) => scrolling.subscribe(run);

export { scrollingOn, subscribeScrolling };
