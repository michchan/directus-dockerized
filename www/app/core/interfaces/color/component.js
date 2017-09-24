/* global _ */
define([
  'core/interfaces/color/interface',
  'core/UIComponent',
  'core/t',
  'core/interfaces/color/lib/color'
], function (Input, UIComponent, __t, color) {
  'use strict';

  return UIComponent.extend({
    id: 'color',
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
        id: 'input',
        ui: 'radio_buttons',
        type: 'String',
        comment: 'The unit in which the user will enter the data',
        default_value: 'hex',
        options: {
          options: {
            hex: 'Hex',
            rgb: 'RGB',
            hsl: 'HSL'
          }
        }
      },
      {
        id: 'output',
        ui: 'radio_buttons',
        type: 'String',
        comment: 'The unit in which the data gets saved to the DB',
        default_value: 'hex',
        options: {
          options: {
            hex: 'Hex',
            rgb: 'RGB',
            hsl: 'HSL'
          }
        }
      },
      {
        id: 'list_view_formatting',
        ui: 'radio_buttons',
        type: 'String',
        comment: 'The output format on the list view',
        default_value: 'swatch',
        options: {
          options: {
            swatch: 'Color Swatch',
            value: 'Value'
          }
        }
      },
      {
        id: 'palette',
        ui: 'tags',
        type: 'String',
        comment: 'Add color options as hex values',
        default_value: ''
      },
      {
        id: 'palette_only',
        ui: 'toggle',
        type: 'Boolean',
        comment: 'Only allow the user to pick from the palette',
        default_value: false
      },
      {
        id: 'allow_alpha',
        ui: 'toggle',
        type: 'Boolean',
        comment: 'Allow values with an alpha channel',
        default_value: false
      }
    ],
    Input: Input,
    validate: function (value, options) {
      if (options.schema.isRequired() && _.isEmpty(value)) {
        return __t('this_field_is_required');
      }
    },
    list: function (options) {
      var value;

      switch (options.settings.get('output')) {
        case 'hex':
          value = options.value || false;
          break;
        case 'rgb':
        case 'hsl':
          value = options.value ?
            options.value.split(',').map(function (color) {
              return Number(color);
            }) :
            false;
          break;
        default:
          return false;
      }

      if (value) {
        var rgbColor = color(value, options.settings.get('output')).rgb;
        var rgb = rgbColor.length === 4 ? 'rgba(' + rgbColor + ')' : 'rgb(' + rgbColor + ')';
        var swatch = '<div style="width: 20px; height: 20px; border-radius: 50%; background-color: ' + rgb + '"></div>';
        return options.settings.get('list_view_formatting') === 'swatch' ? swatch : value;
      }
      return '';
    }
  });
});
