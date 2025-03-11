const blockScroll = () => {
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    document.body.style.overflow = 'hidden';
};

const allowScroll = () => {
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
};

export { allowScroll, blockScroll };
