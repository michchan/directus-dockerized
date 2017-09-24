/* global _ */
define([
  './interface',
  'core/UIComponent',
  'core/t'
], function (Input, UIComponent, __t) {
  'use strict';

  return UIComponent.extend({
    id: 'text_input',
    dataTypes: [
      'VARCHAR',
      'CHAR',
      'TINYTEXT',
      'TEXT',
      'MEDIUMTEXT',
      'LONGTEXT',
      'DATE',
      'TIME',
      'ENUM'
    ],
    variables: [
      {
        id: 'read_only',
        ui: 'toggle',
        type: 'Boolean',
        comment: 'Force this interface to be read only',
        default_value: false
      },
      {
        id: 'size',
        ui: 'dropdown',
        type: 'String',
        comment: 'What width to use for the input',
        default_value: 'large',
        options: {
          options: {
            large: __t('size_large'),
            medium: __t('size_medium'),
            small: __t('size_small')
          }
        }
      },
      {
        id: 'placeholder',
        ui: 'text_input',
        type: 'String',
        comment: 'Enter Placeholder Text',
        default_value: '',
        char_length: 200
      },
      {
        id: 'validation_type',
        ui: 'dropdown',
        type: 'String',
        comment:
          'The type of validation used on this field \n' +
          'Character Blacklist: Choose the characters not allowed in the input \n' +
          'Character Whitelist: Choose the characters allowed in the input \n' +
          'RegEx: Create a regular expression to validate the value. Useful for emails, phone number formatting, or almost anything',
        options: {
          options: {
            bl: __t('character_blacklist'),
            wl: __t('character_whitelist'),
            rgx: __t('regex')
          }
        },
        default_value: 'rgx'
      },
      {
        id: 'validation_string',
        ui: 'text_input',
        type: 'String',
        comment: __t('text_input_validation_string_comment'),
        default_value: '',
        char_length: 200
      },
      {
        id: 'validation_message',
        ui: 'text_input',
        type: 'String',
        comment: 'A message that is shown to the user if the validation fails',
        default_value: '',
        char_length: 200
      }
    ],
    Input: Input,
    validate: function (value, options) {
      var validationMessage = options.settings.get('validation_message') || __t('confirm_invalid_value');

      if (_.isEmpty(value)) {
        if (options.schema.get('required') === true) {
          return __t('this_field_is_required');
        }

        return;
      }

      switch (options.settings.get('validation_type')) {
        case ('wl') :
          var Regex = new RegExp('^[' + options.settings.get('validation_string') + ']+$');
          if (!value.match(Regex)) {
            return validationMessage;
          }
          break;
        case ('bl') :
          var chars = options.settings.get('validation_string').split('');
          if (chars.length > 0 && value.match(chars.join('|'))) {
            return validationMessage;
          }
          break;
        case ('rgx'):
          var regex = new RegExp(options.settings.get('validation_string'));
          if (!regex.test(value)) {
            return validationMessage;
          }
          break;
        default:
          break;
      }
    },
    list: function (options) {
      return (options.value) ? options.value.toString().replace(/<(?:.|\n)*?>/gm, '').substr(0, 100) : '';
    }
  });
});
