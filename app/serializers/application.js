import RESTSerializer from 'ember-data/serializers/rest';

export default RESTSerializer.extend({
  serialize(snapshot, options) {
    const includeId = options && options.includeId;
    const json = snapshot._isChangeset ? this._serializeChangeset(snapshot, includeId) : this._super(...arguments);
    delete json.created;
    delete json.updated;
    return json;
  },

  _serializeChangeset(snapshot, includeId) {
    const json = {};

    if (includeId && snapshot.id) {
      json[this.get('primaryKey')] = snapshot.id;
    }

    snapshot.eachAttribute((name, attr) => {
      this.serializeAttribute(snapshot, json, name, attr);
    });

    snapshot.eachRelationship((key, relationship) => {
      if (relationship.kind === 'belongsTo') {
        this.serializeBelongsTo(snapshot, json, relationship);
      } else if (relationship.kind === 'hasMany') {
        this.serializeHasMany(snapshot, json, relationship);
      }
    });

    return json;
  },
});
