import Ember from 'ember';
import {moduleFor, test} from 'ember-qunit';
import FactoryGuy, {manualSetup, mockCreate} from 'ember-data-factory-guy';
import wait from 'ember-test-helpers/wait';

moduleFor('service:store', 'Unit | Service | store', {
  needs: [
    'model:file',
    'model:user',
  ],

  beforeEach() {
    manualSetup(this.container);
  },
});

test('save directly with changeset updates model', async function(assert) {
  const store = this.subject();
  FactoryGuy.setStore(store);

  Ember.run(async () => {
    const file = store.createRecord('file', {path: 'hello'});

    assert.equal(file.get('name'), null);
    assert.equal(file.get('path'), 'hello');

    mockCreate('file').returns({
      attrs: {
        name: "new-name",
        path: "new-path",
      },
    });

    await file.save();

    assert.notEqual(file.get('id'), null);
    assert.equal(file.get('name'), 'new-name');
    assert.equal(file.get('path'), 'new-path');
  });

  return wait();
});

test('it should update belongsTo', async function(assert) {
  const store = this.subject();
  FactoryGuy.setStore(store);

  Ember.run(async () => {
    const file = store.createRecord('file', {
      path: 'hello',
    });

    assert.equal(file.belongsTo('createdBy').id(), null);

    mockCreate('file').returns({attrs: {
      createdBy: {id: '2'},
    }});

    await file.save();

    // this changes outcome of the tests
    // await file.get('createdBy');

    assert.equal(file.belongsTo('createdBy').id(), '2');
  });

  return wait();
});
