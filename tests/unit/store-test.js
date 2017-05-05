import Ember from 'ember';
import {moduleFor, test} from 'ember-qunit';
import {manualSetup, mockCreate, build} from 'ember-data-factory-guy';
import wait from 'ember-test-helpers/wait';
import Changeset from 'ember-changeset';

moduleFor('service:store', 'Unit | Service | store', {
  needs: [
    'model:file',
    'model:user',
    'serializer:application',
  ],

  beforeEach() {
    manualSetup(this.container);
  },
});

test('save with changeset updates relationships', function(assert) {
  const store = this.subject();

  Ember.run(async () => {
    const user = build('user');
    const file = store.createRecord('file');
    const changeset = new Changeset(file);
    changeset.set('path', 'hello');

    assert.equal(file.belongsTo('createdBy').id(), null);

    mockCreate('file').returns({attrs: {
      createdBy: user,
    }});

    await store.saveChangeset(changeset);

    assert.equal(file.belongsTo('createdBy').id(), user.get('id'));
  });

  return wait();
});

test('it should update belongsTo', function(assert) {

  const store = this.subject();

  Ember.run(async () => {
    const user = build('user');
    const file = store.createRecord('file', {
      path: 'hello',
    });

    assert.equal(file.belongsTo('createdBy').id(), null);

    mockCreate('file').returns({attrs: {
      createdBy: user,
    }});

    await file.save();

    assert.equal(file.belongsTo('createdBy').id(), user.get('id'));
  });

  return wait();
});
