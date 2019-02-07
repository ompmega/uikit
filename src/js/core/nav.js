import Accordion from './accordion';

export default {

    extends: Accordion,

    data: {
        targets: '> .ui-parent',
        toggle: '> a',
        content: '> ul'
    }

};
