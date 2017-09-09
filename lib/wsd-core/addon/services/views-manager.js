import Ember from 'ember';

export default Ember.Service.extend({
    fetchViews: Ember.inject.service('fetch-views'),

    store: Ember.computed(function() {
        return this.get('fetchViews').fetch();
    }).readOnly(),

    findViewConfiguration(viewId) {
        if (isSpecialView(viewId)) {
            return Ember.RSVP.Promise.resolve(new ViewConfiguration(viewId));
        } else {
            return this.get('fetchViews')
                .fetchById(viewId)
                .loadPromise
                .then(() => this.peekViewConfiguration(viewId))
            ;
        }
    },

    peekViewConfiguration(viewId) {
        if (isSpecialView(viewId)) {
            return new ViewConfiguration(viewId);
        } else {
            const viewPromise = this.get('fetchViews').fetchById(viewId);

            console.assert(viewPromise.hasLoaded, 'ViewConfiguration:peekViewConfiguration', 'Unexpected object state', 'View is expected to be loaded already', viewId);

            return new ViewConfiguration(viewId, viewPromise.view);
        }
    },

    getStepViewConfigurations() {
        return [
            ...this.get('store.views')
                .map((view) => this.peekViewConfiguration(view.get('id'))),
            new ViewConfiguration('echo'),
            new ViewConfiguration('dig')
        ];
    },

    getRootViewConfigurations() {
        return [
            'procs',
            'files',
            'directories',
            'sports',
            'connections',
            'spy_users',
            'echo',
            'dig'
        ].map((viewId) => this.peekViewConfiguration(viewId));
    },
});

function isSpecialView(id) {
    return ['overview', 'echo', 'dig'].includes(id);
}

class ViewConfiguration {
    constructor(id, record = null) {
        this.id = id;

        this.record = record;
    }

    get name() {
        if (this.record) {
            return this.record.get('name');
        } else {
            switch (this.id) {
                case 'overview':
                    return 'Overview';
                case 'echo':
                    return 'Echo';
                case 'dig':
                    return 'Dig';

                default:
                    console.assert(false, 'ViewConfiguration:name', 'Unexpected property value', 'View id not valid, or record not available', this);
                    return this.id;
            }
        }
    }
}