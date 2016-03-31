import $ from 'jquery';

UIkit.component('tooltip', {

    mixins: [UIkit.mixin.toggable, UIkit.mixin.position],

    props: {
        delay: Number,
        clsCustom: String
    },

    defaults: {
        pos: 'top',
        offset: 5,
        delay: 0,
        cls: 'uk-active',
        clsPos: 'uk-tooltip'
    },

    ready() {

        this.content = this.$el.attr('title');
        this.$el.removeAttr('title');
        this.tooltip = $(`<div class="uk-tooltip" aria-hidden="true"><div class="uk-tooltip-inner">${this.content}</div></div>`).appendTo('body');

        this.$el.on('focus mouseenter', this.show.bind(this));
        this.$el.on('blur mouseleave', this.hide.bind(this));

    },

    methods: {

        show() {
            clearTimeout(this.showTimer);

            this.showTimer = setTimeout(() => {
                this.positionAt(this.tooltip, this.$el);
                this.toggleElement(this.tooltip, true, true);
            }, this.delay);
        },

        hide() {
            clearTimeout(this.showTimer);
            this.toggleElement(this.tooltip, true, false);
        }

    }

});