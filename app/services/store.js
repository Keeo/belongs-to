import DS from 'ember-data';
import changesetToSnapshot from '../utils/changeset-to-snapshot';

export default DS.Store.extend({
  /*
   * Saves an object by saving changes taken from a changeset.
   * Updates the target object if the operation succeeds.
   * @param changeset the changeset to save
   * @return {Promise} a promise that resolves to an object returned by the server
   */
  saveChangeset(changeset) {
    const record = changeset.get('_content'); // not entirely a public field
    const id = record.get('id');
    const constructor = record.get('constructor');
    const modelName = constructor.modelName;

    const snapshot = changesetToSnapshot(changeset);
    const operation = record.get('isNew') ? 'createRecord' : 'updateRecord';

    record._internalModel.adapterWillCommit();
    return this.adapterFor(modelName)[operation](this, constructor, snapshot)
      .then(res => {
        this._backburner.join(() => {
          // propagate the changes
          const model = this.modelFor(modelName);
          const serializer = this.serializerFor(modelName);
          const payload = serializer.normalizeResponse(this, model, res, id, operation);
          if (payload.included) {
            this._push({data: null, included: payload.included});
          }
          this.didSaveRecord(record._internalModel, {data: payload.data});
          changeset.rollback();
        });
        return res;
      });
  }
});
