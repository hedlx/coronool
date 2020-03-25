import {readable} from 'svelte/store';
import _ from 'lodash';


export const windowSize = readable([window.innerWidth, window.innerHeight], set => {
    const handleResize = _.throttle(() => set([window.innerWidth, window.innerHeight]), 150);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
});
