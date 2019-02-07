import Modal from '../mixin/modal';
import {$, addClass, assign, css, hasClass, height, html, isString, on, Promise, removeClass} from 'uikit-util';

export default {

    install,

    mixins: [Modal],

    data: {
        clsPage: 'ui-modal-page',
        selPanel: '.ui-modal-dialog',
        selClose: '.ui-modal-close, .ui-modal-close-default, .ui-modal-close-outside, .ui-modal-close-full'
    },

    events: [

        {
            name: 'show',

            self: true,

            handler() {

                if (hasClass(this.panel, 'ui-margin-auto-vertical')) {
                    addClass(this.$el, 'ui-flex');
                } else {
                    css(this.$el, 'display', 'block');
                }

                height(this.$el); // force reflow
            }
        },

        {
            name: 'hidden',

            self: true,

            handler() {

                css(this.$el, 'display', '');
                removeClass(this.$el, 'ui-flex');

            }
        }

    ]

};

function install (UIkit) {

    UIkit.modal.dialog = function (content, options) {

        const dialog = UIkit.modal(`
            <div class="ui-modal">
                <div class="ui-modal-dialog">${content}</div>
             </div>
        `, options);

        dialog.show();

        on(dialog.$el, 'hidden', ({target, currentTarget}) => {
            if (target === currentTarget) {
                Promise.resolve(() => dialog.$destroy(true));
            }
        });

        return dialog;
    };

    UIkit.modal.alert = function (message, options) {

        options = assign({bgClose: false, escClose: false, labels: UIkit.modal.labels}, options);

        return new Promise(
            resolve => on(UIkit.modal.dialog(`
                <div class="ui-modal-body">${isString(message) ? message : html(message)}</div>
                <div class="ui-modal-footer ui-text-right">
                    <button class="ui-button ui-button-primary ui-modal-close" autofocus>${options.labels.ok}</button>
                </div>
            `, options).$el, 'hide', resolve)
        );
    };

    UIkit.modal.confirm = function (message, options) {

        options = assign({bgClose: false, escClose: true, labels: UIkit.modal.labels}, options);

        return new Promise((resolve, reject) => {

            const confirm = UIkit.modal.dialog(`
                <form>
                    <div class="ui-modal-body">${isString(message) ? message : html(message)}</div>
                    <div class="ui-modal-footer ui-text-right">
                        <button class="ui-button ui-button-default ui-modal-close" type="button">${options.labels.cancel}</button>
                        <button class="ui-button ui-button-primary" autofocus>${options.labels.ok}</button>
                    </div>
                </form>
            `, options);

            let resolved = false;

            on(confirm.$el, 'submit', 'form', e => {
                e.preventDefault();
                resolve();
                resolved = true;
                confirm.hide();
            });
            on(confirm.$el, 'hide', () => {
                if (!resolved) {
                    reject();
                }
            });

        });
    };

    UIkit.modal.prompt = function (message, value, options) {

        options = assign({bgClose: false, escClose: true, labels: UIkit.modal.labels}, options);

        return new Promise(resolve => {

            const prompt = UIkit.modal.dialog(`
                    <form class="ui-form-stacked">
                        <div class="ui-modal-body">
                            <label>${isString(message) ? message : html(message)}</label>
                            <input class="ui-input" autofocus>
                        </div>
                        <div class="ui-modal-footer ui-text-right">
                            <button class="ui-button ui-button-default ui-modal-close" type="button">${options.labels.cancel}</button>
                            <button class="ui-button ui-button-primary">${options.labels.ok}</button>
                        </div>
                    </form>
                `, options),
                input = $('input', prompt.$el);

            input.value = value;

            let resolved = false;

            on(prompt.$el, 'submit', 'form', e => {
                e.preventDefault();
                resolve(input.value);
                resolved = true;
                prompt.hide();
            });
            on(prompt.$el, 'hide', () => {
                if (!resolved) {
                    resolve(null);
                }
            });

        });
    };

    UIkit.modal.labels = {
        ok: 'Ok',
        cancel: 'Cancel'
    };

}
