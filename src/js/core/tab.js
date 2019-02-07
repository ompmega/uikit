import Switcher from './switcher';
import Class from '../mixin/class';
import {hasClass} from 'uikit-util';

export default {

    mixins: [Class],

    extends: Switcher,

    props: {
        media: Boolean
    },

    data: {
        media: 960,
        attrItem: 'ui-tab-item'
    },

    connected() {

        const cls = hasClass(this.$el, 'ui-tab-left')
            ? 'ui-tab-left'
            : hasClass(this.$el, 'ui-tab-right')
                ? 'ui-tab-right'
                : false;

        if (cls) {
            this.$create('toggle', this.$el, {cls, mode: 'media', media: this.media});
        }
    }

};
