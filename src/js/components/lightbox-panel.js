import Animations from './internal/lightbox-animations';
import Container from '../mixin/container';
import Modal from '../mixin/modal';
import Slideshow from '../mixin/slideshow';
import Togglable from '../mixin/togglable';
import {$, addClass, ajax, append, assign, attr, css, getImage, html, index, once, pointerDown, pointerMove, pointerUp, removeClass, Transition, trigger} from 'uikit-util';

export default {

    mixins: [Container, Modal, Togglable, Slideshow],

    functional: true,

    props: {
        delayControls: Number,
        preload: Number,
        videoAutoplay: Boolean,
        template: String
    },

    data: () => ({
        preload: 1,
        videoAutoplay: false,
        delayControls: 3000,
        items: [],
        cls: 'ui-open',
        clsPage: 'ui-lightbox-page',
        selList: '.ui-lightbox-items',
        attrItem: 'ui-lightbox-item',
        selClose: '.ui-close-large',
        pauseOnHover: false,
        velocity: 2,
        Animations,
        template: `<div class="ui-lightbox ui-overflow-hidden">
                        <ul class="ui-lightbox-items"></ul>
                        <div class="ui-lightbox-toolbar ui-position-top ui-text-right ui-transition-slide-top ui-transition-opaque">
                            <button class="ui-lightbox-toolbar-icon ui-close-large" type="button" ui-close></button>
                         </div>
                        <a class="ui-lightbox-button ui-position-center-left ui-position-medium ui-transition-fade" href="#" ui-slidenav-previous ui-lightbox-item="previous"></a>
                        <a class="ui-lightbox-button ui-position-center-right ui-position-medium ui-transition-fade" href="#" ui-slidenav-next ui-lightbox-item="next"></a>
                        <div class="ui-lightbox-toolbar ui-lightbox-caption ui-position-bottom ui-text-center ui-transition-slide-bottom ui-transition-opaque"></div>
                    </div>`
    }),

    created() {

        this.$mount(append(this.container, this.template));

        this.caption = $('.ui-lightbox-caption', this.$el);

        this.items.forEach(() => append(this.list, '<li></li>'));

    },

    events: [

        {

            name: `${pointerMove} ${pointerDown} keydown`,

            handler: 'showControls'

        },

        {

            name: pointerUp,

            self: true,

            delegate() {
                return this.selSlides;
            },

            handler(e) {
                e.preventDefault();
                this.hide();
            }

        },

        {

            name: 'shown',

            self: true,

            handler() {
                this.startAutoplay();
                this.showControls();
            }

        },

        {

            name: 'hide',

            self: true,

            handler() {

                this.stopAutoplay();
                this.hideControls();

                removeClass(this.slides, this.clsActive);
                Transition.stop(this.slides);

            }
        },

        {

            name: 'hidden',

            self: true,

            handler() {
                this.$destroy(true);
            }

        },

        {

            name: 'keyup',

            el: document,

            handler(e) {

                if (!this.isToggled(this.$el)) {
                    return;
                }

                switch (e.keyCode) {
                    case 37:
                        this.show('previous');
                        break;
                    case 39:
                        this.show('next');
                        break;
                }
            }
        },

        {

            name: 'beforeitemshow',

            handler(e) {

                if (this.isToggled()) {
                    return;
                }

                this.draggable = false;

                e.preventDefault();

                this.toggleNow(this.$el, true);

                this.animation = Animations['scale'];
                removeClass(e.target, this.clsActive);
                this.stack.splice(1, 0, this.index);

            }

        },

        {

            name: 'itemshow',

            handler({target}) {

                const i = index(target);
                const {caption} = this.getItem(i);

                css(this.caption, 'display', caption ? '' : 'none');
                html(this.caption, caption);

                for (let j = 0; j <= this.preload; j++) {
                    this.loadItem(this.getIndex(i + j));
                    this.loadItem(this.getIndex(i - j));
                }

            }

        },

        {

            name: 'itemshown',

            handler() {
                this.draggable = this.$props.draggable;
            }

        },

        {

            name: 'itemload',

            handler(_, item) {

                const {source, type, alt} = item;

                this.setItem(item, '<span ui-spinner></span>');

                if (!source) {
                    return;
                }

                let matches;

                // Image
                if (type === 'image' || source.match(/\.(jp(e)?g|png|gif|svg)($|\?)/i)) {

                    getImage(source).then(
                        img => this.setItem(item, `<img width="${img.width}" height="${img.height}" src="${source}" alt="${alt ? alt : ''}">`),
                        () => this.setError(item)
                    );

                    // Video
                } else if (type === 'video' || source.match(/\.(mp4|webm|ogv)($|\?)/i)) {

                    const video = $(`<video controls playsinline${item.poster ? ` poster="${item.poster}"` : ''} ui-video="${this.videoAutoplay}"></video>`);
                    attr(video, 'src', source);

                    once(video, 'error loadedmetadata', type => {
                        if (type === 'error') {
                            this.setError(item);
                        } else {
                            attr(video, {width: video.videoWidth, height: video.videoHeight});
                            this.setItem(item, video);
                        }
                    });

                    // Iframe
                } else if (type === 'iframe' || source.match(/\.(html|php)($|\?)/i)) {

                    this.setItem(item, `<iframe class="ui-lightbox-iframe" src="${source}" frameborder="0" allowfullscreen></iframe>`);

                    // YouTube
                } else if ((matches = source.match(/\/\/.*?youtube(-nocookie)?\.[a-z]+\/watch\?v=([^&\s]+)/) || source.match(/()youtu\.be\/(.*)/))) {

                    const [, , id] = matches;
                    const setIframe = (width = 640, height = 450) => this.setItem(item, getIframe(`https://www.youtube${matches[1] || ''}.com/embed/${id}`, width, height, this.videoAutoplay));

                    getImage(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`).then(
                        ({width, height}) => {
                            // YouTube default 404 thumb, fall back to low resolution
                            if (width === 120 && height === 90) {
                                getImage(`https://img.youtube.com/vi/${id}/0.jpg`).then(
                                    ({width, height}) => setIframe(width, height),
                                    setIframe
                                );
                            } else {
                                setIframe(width, height);
                            }
                        },
                        setIframe
                    );

                    // Vimeo
                } else if ((matches = source.match(/(\/\/.*?)vimeo\.[a-z]+\/([0-9]+).*?/))) {

                    ajax(`https://vimeo.com/api/oembed.json?maxwidth=1920&url=${encodeURI(source)}`, {responseType: 'json', withCredentials: false})
                        .then(
                            ({response: {height, width}}) => this.setItem(item, getIframe(`https://player.vimeo.com/video/${matches[2]}`, width, height, this.videoAutoplay)),
                            () => this.setError(item)
                        );

                }

            }

        }

    ],

    methods: {

        loadItem(index = this.index) {

            const item = this.getItem(index);

            if (item.content) {
                return;
            }

            trigger(this.$el, 'itemload', [item]);
        },

        getItem(index = this.index) {
            return this.items[index] || {};
        },

        setItem(item, content) {
            assign(item, {content});
            const el = html(this.slides[this.items.indexOf(item)], content);
            trigger(this.$el, 'itemloaded', [this, el]);
            this.$update(el);
        },

        setError(item) {
            this.setItem(item, '<span ui-icon="icon: bolt; ratio: 2"></span>');
        },

        showControls() {

            clearTimeout(this.controlsTimer);
            this.controlsTimer = setTimeout(this.hideControls, this.delayControls);

            addClass(this.$el, 'ui-active', 'ui-transition-active');

        },

        hideControls() {
            removeClass(this.$el, 'ui-active', 'ui-transition-active');
        }

    }

};

function getIframe(src, width, height, autoplay) {
    return `<iframe src="${src}" width="${width}" height="${height}" style="max-width: 100%; box-sizing: border-box;" frameborder="0" allowfullscreen ui-video="autoplay: ${autoplay}" ui-responsive></iframe>`;
}
