/* global $ */
define([
  'utils',
  'underscore',
  'core/UIView',
  'tinyMCE'
], function (Utils, _, UIView, tinyMCE) {
  'use strict';

  return UIView.extend({
    template: 'wysiwyg_full/input',

    serialize: function () {
      var value = this.options.value || '';

      return {
        value: value,
        readOnly: this.options.settings.get('read_only') || !this.options.canWrite,
        name: this.options.name
      };
    },

    afterRender: function () {
      var self = this;
      var settings = this.options.settings;
      var elementpath = Boolean(Number(settings.get('show_element_path')));
      var styleFormats = []; // Format menu (styleselect) options
      var headings = getCheckboxesSettings('headings');
      var inline = getCheckboxesSettings('inline');
      var blocks = getCheckboxesSettings('blocks');
      var alignment = getCheckboxesSettings('alignment');
      var toolbarOptions = getCheckboxesSettings('toolbar_options');
      var toolbar;

      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      if (headings.length > 0) {
        styleFormats.push({
          title: 'Headings',
          items: headings.map(function (heading) {
            return {
              title: 'Heading ' + heading.slice(-1), // Heading + last char of h1 thru h6 = 1...6
              format: heading
            };
          })
        });
      }

      if (inline.length > 0) {
        styleFormats.push({
          title: 'Inline',
          items: inline.map(function (option) {
            return {
              title: capitalizeFirstLetter(option),
              icon: option,
              format: option
            };
          })
        });
      }

      if (blocks.length > 0) {
        styleFormats.push({
          title: 'Blocks',
          items: blocks.map(function (option) {
            return {
              title: option === 'p' ? 'Paragraph' : capitalizeFirstLetter(option),
              format: option
            };
          })
        });
      }

      if (alignment.length > 0) {
        styleFormats.push({
          title: 'Alignment',
          items: alignment.map(function (option) {
            return {
              title: capitalizeFirstLetter(option.substring(5)),
              icon: option,
              format: option
            };
          })
        });
      }

      toolbar = (styleFormats.length > 0 ? 'styleselect ' : '');

      if (toolbarOptions.length > 0) {
        // Convert inline / alignment to appropriate options & add to toolbar
        toolbar += toolbarOptions
          .map(function (option) {
            if (option === 'inline') {
              return inline.reduce(function (inlineStr, inlineOption) {
                return inlineStr + ' ' + inlineOption;
              });
            } else if (option === 'alignment') {
              return alignment.reduce(function (alignmentStr, alignmentOption) {
                return alignmentStr + ' ' + alignmentOption;
              });
            }
            return option;
          })
          .reduce(function (str, option) {
            return str + ' ' + option;
          });
      }

      toolbar += settings.get('custom_toolbar_options');

      // Parse custom_wrapper and add to toolbar
      var customWrapperSettings;
      if (settings.get('custom_wrapper').length > 0) {
        try {
          customWrapperSettings = JSON.parse(settings.get('custom_wrapper'));
        } catch (err) {
          console.error(err);
        }

        toolbar += ' | ' + Object.keys(customWrapperSettings).join(' ');
      }

      tinyMCE.init({
        plugins: 'table hr lists link image print pagebreak code insertdatetime media autoresize paste preview',
        selector: '#wysiwyg_' + this.options.name,
        branding: false,
        skin: 'directus',
        autoresize_max_height: this.options.settings.get('max_height'),
        elementpath: elementpath,
        statusbar: elementpath,
        menubar: false,
        readonly: this.options.settings.get('read_only') || !this.options.canWrite,
        toolbar: toolbar,
        content_style: 'body.mce-content-body {font-family: \'Roboto\', sans-serif;line-height:24px;letter-spacing:0.2px;font-size:14px;color:#333;margin:0;padding: 10px 30px !important;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}body.mce-content-body p{line-height:inherit !important;}',
        style_formats: styleFormats,
        setup: function (editor) {
          // NOTE: Do we need this?
          var saveEditorContents = _.debounce(function () {
            if (editor && editor.getContent) {
              var content = editor.getContent();
              var value = self.model.get(self.name);

              if ((Utils.isNothing(value) || value !== content) && Utils.isSomething(content)) {
                self.model.set(self.name, content);
                self.$el.find('textarea')[0].innerHTML = content;
              }
            }
          }, 500);

          var onEditorInit = function () {
            self.$body = $(editor.getBody());
          };

          editor.on('init', onEditorInit);

          // All events on which the contents of the editor should be saved
          editor.on('input', saveEditorContents);
          editor.on('ExecCommand', saveEditorContents);
          editor.on('blur', saveEditorContents);
          editor.on('paste', saveEditorContents);
          editor.on('undo', saveEditorContents);
          editor.on('redo', saveEditorContents);
          editor.on('NodeChange', saveEditorContents);

          if (customWrapperSettings) {
            var previewStyles = '';

            Object.keys(customWrapperSettings).map(function (identifier) {
              // Add preview styling if set
              if (customWrapperSettings[identifier].selector && customWrapperSettings[identifier].preview_style) {
                previewStyles += customWrapperSettings[identifier].selector + ' {' + customWrapperSettings[identifier].preview_style + '}\n';
              }

              // Add button to editor
              editor.addButton(identifier, {
                title: customWrapperSettings[identifier].name,
                text: customWrapperSettings[identifier].label || customWrapperSettings[identifier].name.match(/\b(\w)/g).join('').toUpperCase(),
                onclick: function () {
                  var text = editor.selection.getContent({format: 'text'});
                  if (text && text.length > 0) {
                    editor.execCommand('mceInsertContent', false, customWrapperSettings[identifier].template.replace(/{{text}}/g, text));
                  }
                }
              });
            });

            previewStyles = String(previewStyles);

            // This = tinyMCE instance
            this.contentStyles.push(previewStyles);
          }

          // Add focus styles
          editor.on('focus', function (e) {
            e.target.editorContainer.classList.add('focus');
          });

          editor.on('blur', function (e) {
            e.target.editorContainer.classList.remove('focus');
          });
        }
      });

      function getCheckboxesSettings(name) {
        return settings
          .get(name)
          .split(',')
          .filter(function (option) {
            return option.length > 0;
          });
      }
    },

    cleanup: function () {
      // Remove tinyMCE
      tinyMCE.remove();
    }
  });
});
