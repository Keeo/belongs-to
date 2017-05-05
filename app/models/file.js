import DS from 'ember-data';

export default DS.Model.extend({
  path: DS.attr(),
  name: DS.attr(),
  createdBy: DS.belongsTo('user')
});
