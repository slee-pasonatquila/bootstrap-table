/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * extensions: https://github.com/vitalets/x-editable
 */

!function ($) {

    'use strict';

    $.extend($.fn.bootstrapTable.defaults, {
        editable: true,
        onEditableInit: function () {
            return false;
        },
        onEditableSave: function (field, row, oldValue, $el) {
            return false;
        }
    });

    $.extend($.fn.bootstrapTable.Constructor.EVENTS, {
        'editable-init.bs.table': 'onEditableInit',
        'editable-save.bs.table': 'onEditableSave'
    });

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initTable = BootstrapTable.prototype.initTable,
        _initBody = BootstrapTable.prototype.initBody;

    BootstrapTable.prototype.initTable = function () {
        var that = this;
        _initTable.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.editable) {
            return;
        }

        $.each(this.columns, function (i, column) {
            if (!column.editable) {
                return;
            }

            var editableOptions = {}, editableDataMarkup = [], editableDataPrefix = 'editable-';

            var processDataOptions = function(key, value) {
              // Replace camel case with dashes.
              var dashKey = key.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
              if (dashKey.slice(0, editableDataPrefix.length) == editableDataPrefix) {
                var dataKey = dashKey.replace(editableDataPrefix, 'data-');
                editableOptions[dataKey] = value;
              }
            };

            $.each(that.options, processDataOptions);

            var _formatter = column.formatter;
            column.formatter = function (value, row, index) {
                /*var result = _formatter ? _formatter(value, row, index) : value;

                $.each(column, processDataOptions);

                $.each(editableOptions, function (key, value) {
                    editableDataMarkup.push(' ' + key + '="' + value + '"');
                });
                
                var _dont_edit_formatter = false;
                if (column.editable.hasOwnProperty('noeditFormatter')) {
                    _dont_edit_formatter = column.editable.noeditFormatter(value, row, index);
                }
  
                if (_dont_edit_formatter === false) {
                    return ['<a href="javascript:void(0)"',
                        ' data-name="' + column.field + '"',
                        ' data-pk="' + row[that.options.idField] + '"',
                        ' data-value="' + result + '"',
                        editableDataMarkup.join(''),
                        '>' + '</a>'
                    ].join('');
                } else {
                    return _dont_edit_formatter;
                }

                return ['<a href="javascript:void(0)"',
                    ' data-name="' + column.field + '"',
                    ' data-pk="' + row[that.options.idField] + '"',
                    ' data-value="' + result + '"',
                    editableDataMarkup.join(''),
                    '>' + '</a>'
                ].join('');*/
                var result = _formatter ? _formatter(value, row, index) : value;

                if (row.canEdit) {
                    var sEditType = column.editable.type;
                    var sEditSource = column.editable.source;
                    var editElMap = {
                        number  : [
                            '<input type="number" class="tableInputNumber"', ' data-name="' + column.field + '"',
                            ' data-pk="' + row[that.options.idField] + '"',
                            ' data-value="' + result + '"',
                            ' value="' + result + '"/>'
                        ],
                        select  : [
                            "<select class='tableInputSelect' size=1", ' data-name="' + column.field + '"',
                            ' data-pk="' + row[that.options.idField] + '"',
                            ' data-value="' + result + '">'
                        ],
                        text    : [
                            '<input class="tableInputText" type="text"', ' data-name="' + column.field + '"',
                            ' data-pk="' + row[that.options.idField] + '"',
                            ' data-value="' + result + '"',
                            ' value="' + result + '"/>'
                        ],
                        textarea: [
                            '<textarea class="tableInputArea" rows=2 style="font-size:10px;"', ' data-name="' + column.field + '"',
                            ' data-pk="' + row[that.options.idField] + '"',
                            ' data-value="' + result + '">',
                            g,
                            "</textarea>"
                        ]
                    };
                    var sTargetEl = editMap[sEditType];
                    if (sEditType == 'select') {
                        _.forEach(sEditSource, function(val) {
                            sTargetEl.push(val.value == result ? '<option value="' + val.value + '" selected>' + val.text + "</option>" : '<option value="' + val.value + '">' + val.text + "</option>");
                        });
                        sTargetEl.push('</select>');
                    }
                    return sTargetEl.join('');
                }

                return result;
            };
        });
    };

    BootstrapTable.prototype.initBody = function () {
        var that = this;
        _initBody.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.editable) {
            return;
        }

        $.each(this.columns, function (i, column) {
            if (!column.editable) {
                return;
            }
            that.$body.find('input[data-name="' + column.field + '"]').off('change').on('change', function() {
                var data = that.getData(),
                    index = $(this).parents('tr[data-index]').data('index'),
                    row = data[index],
                    oldValue = row[column.field];
                row[column.field] = $(this).val();
                that.trigger('editable-save', column.field, row, oldValue, $(this));
                that.resetFooter();
            });
            that.$body.find('select[data-name="' + column.field + '"]').off('change').on('change', function() {
                var data = that.getData(),
                    index = $(this).parents('tr[data-index]').data('index'),
                    row = data[index],
                    oldValue = row[column.field];
                row[column.field] = $(this).val();
                that.trigger('editable-save', column.field, row, oldValue, $(this));
                that.resetFooter();
            });
            that.$body.find('textarea[data-name="' + column.field + '"]').off('change').on('change', function() {
                var data = that.getData(),
                    index = $(this).parents('tr[data-index]').data('index'),
                    row = data[index],
                    oldValue = row[column.field];
                row[column.field] = $(this).val();
                that.trigger('editable-save', column.field, row, oldValue, $(this));
                that.resetFooter();
            });
        });
        this.trigger('editable-init');
    };

}(jQuery);
