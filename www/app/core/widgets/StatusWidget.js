define([
  'app',
  'underscore',
  'backbone'
],
function(app, _, Backbone) {

  'use strict';

  return Backbone.Layout.extend({

    template: 'core/widgets/status',

    tagName: 'div',

    attributes: {
      class: 'status'
    },

    state: {
      open: false
    },

    events: {
      'click .js-status': function (event) {
        this.$el.toggleClass('expanded');
        this.state.open = !this.state.open;
      },

      'click li': function (event) {
        if (this.state.open) {
          this.$('li').removeClass('active');
          var $status = $(event.currentTarget);
          $status.addClass('active');

          this.model.set(this.getStatusColumnName(), $status.data('id'));
        }
      }
    },

    getStatusColumnName: function () {
      var table = this.model.table;

      return table.getStatusColumnName();
    },

    serialize: function () {
      var statuses = [];
      var model = this.model;
      var structure = model.structure;
      var attr = this.getStatusColumnName();
      var currentStatus = this.model.get(attr);

      if (!currentStatus && structure.get(attr)) {
        currentStatus = structure.get(attr).get('default_value');
      }

      _.each(model.getStatusVisible(), function (status) {
        var item = status.toJSON();

        // NOTE: do not strictly compare as status can (will) be string
        item.selected = status.get('id') == currentStatus;
        item.model = status;
        item.color = item.background_color || item.color;
        statuses.push(item);
      });

      statuses = _.sortBy(statuses, function(item) {
        return item.sort;
      });

      return {
        model: this.model,
        readonly: typeof this.model.canEdit === 'function' ? this.model.canEdit(attr) : true,
        statuses: statuses
      };
    },

    initialize: function () {
      if (this.getStatusColumnName()) {
        this.model.on('change:' + this.getStatusColumnName(), this.render, this);
      }
    }
  });
});
