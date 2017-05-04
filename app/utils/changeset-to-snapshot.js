import Ember from 'ember';
const {assert, get} = Ember;

/**
 * Creates s snapshot-like object based on a changeset.
 */
export default function changesetToSnapshot(changeset) {
  const model = changeset.get('_content'); // not entirely a public field
  const isNew = model.get('isNew');
  const id = model.get('id');
  const constructor = model.get('constructor');
  const modelName = constructor.modelName;

  const changes = {};
  changeset.get('changes').forEach(change => {
    changes[change.key] = null; // The value does not matter
  });

  const filterByName = fn => (name, meta) => { // eslint-disable-line func-style
    if (name in changes) {
      fn(name, meta);
    }
  };

  const fieldFilter = isNew ? fn => fn : filterByName;

  return { // emulate a snapshot
    _isChangeset: true,
    type: constructor,
    record: model,
    modelName,
    id,
    eachAttribute: fn => model.eachAttribute(fieldFilter(fn)),
    eachRelationship: fn => model.eachRelationship(fieldFilter(fn)),
    attr: key => changeset.get(key),
    belongsTo(key, options) {
      assert('Snapshot from changeset can only return the id of a belongsTo relationship, not a snapshot of it', options && options.id);
      return get(changeset, key + '.id');
    },
    hasMany(key, options) {
      assert('Snapshot from changeset can only return the ids of a hasMany relationship, not an array of snapshots', options && options.ids);
      return changeset.get(key).map(e => e.get('id'));
    },
  };
}
