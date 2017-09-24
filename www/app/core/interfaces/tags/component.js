define([
  'core/interfaces/tags/interface',
  'underscore',
  'core/UIComponent',
  'core/t'
], function (Input, _, UIComponent, __t) {
  'use strict';

  return UIComponent.extend({
    id: 'tags',
    dataTypes: ['VARCHAR', 'CHAR', 'TINYTEXT', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT'],
    variables: [
      {
        id: 'read_only',
        ui: 'toggle',
        type: 'Boolean',
        comment: 'Force this interface to be read only',
        default_value: false
      },
      {
        id: 'force_lowercase',
        ui: 'toggle',
        type: 'Boolean',
        comment: 'Convert all tags to lowercase',
        default_value: true
      }
      // TODO: Include spaces in CSV value
    ],
    Input: Input,
    validate: function (value, options) {
      if (options.schema.isRequired() && _.isEmpty(value)) {
        return __t('this_field_is_required');
      }
    },
    list: function (options) {
      var tags = options.model.attributes.tags ? options.model.attributes.tags.split(',') : [];

      if (tags.length > 0) {
        for (var i = 0; i < tags.length; i++) {
          tags[i] = '<span class="tag">' + tags[i] + '</span>';
        }

        return '<span class="tag-container"><div class="fade-out"></div>' + tags.join(' ') + '</span>';
      }
      return options.model.attributes.tags;
    }
  });
});
