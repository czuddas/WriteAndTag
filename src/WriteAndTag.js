/**
 * Allows you to write text and recognize custom multiple tags inside it.
 *
 * Requires jQuery and jQuery UI.
 *
 * @version 0.1.0
 * @author Cristian Zuddas
 * @constructor
 */
var WriteAndTag = function() {

    /**
     * List of custom tags to be recognized with their respective autocompletion values.
     * @member WriteAndTag._tags
     * @type {null|Array}
     * @since 0.1.0
     * @private
     */
	var _tags = null;

    /**
     * jQuery selector of the <div> on which the user will write the text.
     * The <div> will automatically be made "contentEditable".
     * @member WriteAndTag._container
     * @type {null|string}
     * @since 0.1.0
     * @private
     */
	var _container = null;

    /**
     * Character or string to use as a tag separator (default value: `&nbsp;`).
     * @member WriteAndTag._tag_separator
     * @type {null|string}
     * @since 0.1.0
     * @private
     */
	var _tag_separator = '&nbsp;';

    /**
     * Alphabetically sort the items in the autocomplete menu.
     * @member WriteAndTag._sorting
     * @type {boolean}
     * @since 0.1.0
     * @private
     */
	var _sorting = true;

    /**
     * Tells if the user is typing a tag at any given time.
     * @member WriteAndTag._is_writing_tag
     * @type {boolean}
     * @since 0.1.0
     * @private
     */
	var _is_writing_tag = false;

    /**
     * It will contain the list of items to show in the autocomplete menu.
     * @member WriteAndTag._autocomplete_source
     * @type {null|Array}
     * @since 0.1.0
     * @private
     */
	var _autocomplete_source = null;

    /**
     * It will contain the word the user is typing as a tag.
     * @member WriteAndTag._tagged_word
     * @type {null|string}
     * @since 0.1.0
     * @private
     */
	var _tagged_word = null;


    /**
     * See the corresponding public method declaration [setTags]{@link WriteAndTag.setTags}
     * @method WriteAndTag._setTags
     * @private
     */
	var _setTags = function (tags) {
	    if (typeof tags=='object') {
            _tags = tags;
            _start();
        }
    };


    /**
     * See the corresponding public method declaration [setContainer]{@link WriteAndTag.setContainer}
     * @method WriteAndTag._setContainer
     * @private
     */
	var _setContainer = function (container) {
	    if (typeof container=='string' && $(container).length) {
            _container = container;
            $(container).attr('contentEditable', true);
            _start();
        }
    };


    /**
     * See the corresponding public method declaration [setSorting]{@link WriteAndTag.setSorting}
     * @method WriteAndTag._setSorting
     * @private
     */
	var _setSorting = function (sorting) {
	    if (typeof sorting=='boolean')
            _sorting = sorting;
    };


    /**
     * See the corresponding public method declaration [setTagSeparator]{@link WriteAndTag.setTagSeparator}
     * @method WriteAndTag._setTagSeparator
     * @private
     */
	var _setTagSeparator = function (tag_separator) {
	    if (typeof tag_separator=='string')
            _tag_separator = tag_separator.replace(/\s/g, '&nbsp;');
    };


    /**
     * See the corresponding public method declaration [getPlainText]{@link WriteAndTag.getPlainText}
     * @method WriteAndTag._getPlainText
     * @private
     */
	var _getPlainText = function () {
	    return $(_container).text();
    };


    /**
     * See the corresponding public method declaration [getHtml]{@link WriteAndTag.getHtml}
     * @method WriteAndTag._getHtml
     * @private
     */
	var _getHtml = function () {
	    return _getCleanHtml();
    };


    /**
     * See the corresponding public method declaration [getJson]{@link WriteAndTag.getJson}
     * @method WriteAndTag._getJson
     * @private
     */
	var _getJson = function () {
	    var result = [];
	    var html = _getCleanHtml();
	    var open_tag = '<span';
	    var close_tag = '</span>';

	    // Iterates the html string and looks for the <span>
	    do {
	        var found_span = false;
	        var open_tag_pos = html.indexOf(open_tag);
	        var part_txt = '';

	        // There is a <span> at the beginning of the string, so look for the closing </span>
	        if (open_tag_pos === 0) {
                var close_tag_pos = html.indexOf(close_tag);
                part_txt = html.substr(0, close_tag_pos + close_tag.length);
                html = html.substr(close_tag_pos + close_tag.length);
            }

	        // There is some text at the beginning of the string, so retrieve it
	        else if (open_tag_pos > 0) {
                part_txt = html.substr(0, open_tag_pos);
                html = html.substr(open_tag_pos);
            }

	        // Only a last piece of text remains
            else {
                part_txt = html;
                html = '';
            }

	        if (part_txt.length) {
	            var part = {
                    'plainText': part_txt
                };
                result.push(part);
                found_span = true;
            }
        } while(found_span);

	    // Scroll through the array to reconstruct the end tags and remove the HTML code entirely
        for (var i in result) {
            if (result[i].plainText.indexOf(open_tag) === 0) {
                var obj = $(result[i].plainText);
                var tag_char = obj.data('writeandtag-tag');
                var tag_value = obj.data('writeandtag-value');

                result[i].tag = {
                    'char' : tag_char,
                    'value' : tag_value,
                    'fullTag' : obj.html()
                }
                result[i].plainText = obj.html().substr(1);
            }
        }

	    return result
    };


    /**
     * Start processing the system if we have all the necessary data
     * @method WriteAndTag._start
     * @returns {boolean}
     * @since 0.1.0
     * @private
     */
	var _start = function () {
	    if (typeof _tags=='object' && typeof _container=='string') {
	        _subscribeEvents();
        }
    };


    /**
     * Subscribes all the required events.
     * @method WriteAndTag._subscribeEvents
     * @since 0.1.0
     * @private
     */
	var _subscribeEvents = function () {

	    /*
	     * Check typing on container
	     */
	    $(_container).keydown(function(e) {
            if (e.key.toLowerCase() !== 'tab' || !$(this).data( "ui-autocomplete" ).menu.active)
                _matchTag(e, this);
        });

	    /*
	     * Cleans any additional HTML code in the editable div (bold, italics, etc)
	     */
	    $(_container).keyup(function(e) {
	        if (!_isCharShift(e) && !_isCharArrow(e) && !_isCharBackspace(e)) {
                $(_container).html(_getCleanHtml(false));
                _placeCaretAtEnd(this);
            }
        });

	    /*
	     * Inhibits the paste
	     */
	    $(_container).on('paste', function(e) {
	        e.preventDefault();
	        return false;
        });
    };


    /**
     * Checks if the character passed matches a tag, and initializes the corresponding autocompletion
     * @method WriteAndTag._matchTag
     * @param {Event} event - A `keyup` event
     * @param {Object} dom_obj - Object that triggered the event
     * @since 0.1.0
     * @private
     */
    var _matchTag = function (event, dom_obj) {
        if (typeof event.key=='string') {
            var char = event.key;

            /*
             * The user is starting to type a tag
             */
            if (typeof char == 'string' && char.length === 1) {
                if (_isTagStart(char)) {
                    event.preventDefault();
                    _setIsWritingTag(true);

                    // Highlights this tag with a <span>
                    $(_container).append('<span data-writeandtag="true">' + char + '</span>');

                    _placeCaretAtEnd(dom_obj);
                    _setAutocompleteSource(char);
                }

                /*
                 * The user has finished typing a tag
                 */
                else if (_isTagEnd(char)) {
                    event.preventDefault();
                    content = $(_container).html() + '&nbsp;';
                    $(_container).html(content);
                    _placeCaretAtEnd(dom_obj);
                    _setIsWritingTag(false);
                    _setAutocompleteSource(null);
                }

                /*
                 * The user is typing the tag content.
                 * Must not be under the "else if"
                 */
                if (_getIsWritingTag() && _autocomplete_source != null) {

                    // Retrieves the word the user is typing as a tag
                    _setTaggedWord($(_container + ' span').last(), char, event);

                    $(_container).autocomplete({
                        minLength: 0,
                        source: function (request, response) {
                            response($.ui.autocomplete.filter(
                                _autocomplete_source, _tagged_word
                            ));
                        },
                        focus: function (event, ui) {
                            return false;
                        },
                        select: function (event, ui) {
                            var span = $(_container + ' span').last();
                            var tagged_word = span.html();
                            var tagged_char = tagged_word.substr(0, 1);
                            tagged_word = tagged_char + ui.item.label;

                            span.attr('data-writeandtag-tag', tagged_char);
                            span.attr('data-writeandtag-value', ui.item.value);
                            span.html(tagged_word);

                            if (_tag_separator.length)
                                $(_container).append(_tag_separator);

                            _placeCaretAtEnd(dom_obj);
                            _setIsWritingTag(false);

                            $(_container).autocomplete("destroy");
                            return false;
                        }
                    })
                        .autocomplete("instance")._renderItem = function (ul, item) {
                        return $("<li>")
                            .append("<div>" + item.label + "</div>")
                            .appendTo(ul);
                    };
                }
            }
        }
    };


    /**
     * Returns the configuration that matches a particular tag-character.
     * @method WriteAndTag._getTagConfigFromChar
     * @param {string} char - A character that identifies a tag
     * @returns {null|Object}
     * @since 0.1.0
     * @private
     */
	var _getTagConfigFromChar = function (char) {
	    var result = null;

	    for (var i in _tags) {
	        var tag = _tags[i];
	        if (typeof tag['tag']=='string' && tag['tag']===char) {
	            result = tag;
	            break;
            }
        }

	    return result;
    };


    /**
     * Returns the list of elements for the autocompete
     * @method WriteAndTag._getAutocompleteElementsList
     * @param {string} char - A character that identifies a tag
     * @returns {null|Object}
     * @since 0.1.0
     * @private
     */
	var _getAutocompleteElementsList = function (char) {
	    var result = null;
	    var conf = _getTagConfigFromChar(char);

	    if (conf!==null && typeof conf.autocomplete=='object') {
	        result = conf.autocomplete;
	        if (_sorting)
                result = _sortAutocompleteElementsList(result);
        }

	    return result;
    };


    /**
     * Alphabetically sort the items in the autocomplete menu.
     * @method WriteAndTag._sortAutocompleteElementsList
     * @param {Object[]} list - A character that identifies a tag
     * @returns {null|Object}
     * @since 0.1.0
     * @private
     */
	var _sortAutocompleteElementsList = function (list) {
	    if (list!==null && typeof list=='object' && list.length) {
	        list.sort(function(a, b){
                var aLabel = a.label.toLowerCase();
                var bLabel = b.label.toLowerCase();
                return ((aLabel < bLabel) ? -1 : ((aLabel > bLabel) ? 1 : 0));
            });
        }

	    return list;
    };

    /**
     * Retrieve the list of items to show in the autocomplete menu
     * @method WriteAndTag._setAutocompleteSource
     * @param {null|string} char - A character that identifies a tag
     * @since 0.1.0
     * @private
     */
	var _setAutocompleteSource = function (char) {
	    if (char==null)
	        _autocomplete_source = null;
	    else if (typeof char=='string' && char.length===1)
	        _autocomplete_source = _getAutocompleteElementsList(char);
    };


    /**
     * Says whether the char identifies the start of a tag
     * @method WriteAndTag._isTagStart
     * @param {string} char - The character to check
     * @returns {boolean}
     * @since 0.1.0
     * @private
     */
    var _isTagStart = function (char) {
	    return (!_getIsWritingTag() && _isTagIdentificationChar(char));
    };


    /**
     * Says whether the char identifies the end of a tag
     * @method WriteAndTag._isTagEnd
     * @param {string} char - The character to check
     * @returns {boolean}
     * @since 0.1.0
     * @private
     */
    var _isTagEnd = function (char) {
        return (_getIsWritingTag() && char===' ');
    };


    /**
     * Tells if the char matches one of those configured for tag identification.
     * @method WriteAndTag._isTagIdentificationChar
     * @param {string} char - The character to check
     * @returns {boolean}
     * @since 0.1.0
     * @private
     */
    var _isTagIdentificationChar = function (char) {
        return _getTagConfigFromChar(char)!==null;
    };


    /**
     * Set the `_is_writing_tag` attribute (it has been isolated on a method for future developments).
     * @method WriteAndTag._setIsWritingTag
     * @since 0.1.0
     * @private
     */
    var _setIsWritingTag = function (is_writing_tag) {
        if (typeof is_writing_tag=='boolean')
	        _is_writing_tag = is_writing_tag;
    };

    /**
     * Says if the user is typing a tag right now (it has been isolated on a method for future developments).
     * @method WriteAndTag._getIsWritingTag
     * @returns {boolean}
     * @since 0.1.0
     * @private
     */
    var _getIsWritingTag = function () {
	    return _is_writing_tag;
    };


    /**
     * Move the writing caret to the end of the text.
     *
     * Based on one of the many similar functions found on the Internet ({@link http://jsfiddle.net/0ktff3zj/1/|like this}).
     * @method WriteAndTag._placeCaretAtEnd
     * @param {Object} el - A DOM element
     * @since 0.1.0
     * @private
     */
    var _placeCaretAtEnd = function(el) {
        el.focus();
        if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
        else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    };


    /**
     * Retrieves the word the user is typing as a tag.
     * @method WriteAndTag._setTaggedWord
     * @param {Object} dom_obj - DOM object that contains the tag being composed
     * @param {string} char - Last typed character
     * @param {Event} event - A `keydown` event
     * @since 0.1.0
     * @private
     */
    var _setTaggedWord = function (dom_obj, char, event) {
        _tagged_word = '';
        if (dom_obj.length) {
            var tag = dom_obj.html();

            // Removes the first character which is the tag
            _tagged_word = tag.substring(1);

            // Constructs the complete string (if the user typed a character or deleted it)
            if (_isCharBackspace(event))
                _tagged_word = _tagged_word.substring(0, _tagged_word.length-1);
            else if (!_isTagIdentificationChar(char))
                _tagged_word += char;
        }
    };


    /**
     * Says if the last typed character is the Backspace
     * @method WriteAndTag._isCharBackspace
     * @param {Event} event - A `keydown`, `keyup` or `keypress` event
     * @returns {boolean}
     * @since 0.1.0
     * @private
     */
    var _isCharBackspace = function (event) {
        return event.key.toLowerCase() === 'backspace';
    };


    /**
     * Says if the last typed character is the Shift
     * @method WriteAndTag._isCharShift
     * @param {Event} event - A `keydown`, `keyup` or `keypress` event
     * @returns {boolean}
     * @since 0.1.0
     * @private
     */
    var _isCharShift = function (event) {
        return event.key.toLowerCase() === 'shift';
    };


    /**
     * Says if the last typed character is one of the arrows (`ArrowUp`, `ArrowDown`, `ArrowRight`, `ArrowLeft`).
     * @method WriteAndTag._isCharArrow
     * @param {Event} event - A `keydown`, `keyup` or `keypress` event
     * @returns {boolean}
     * @since 0.1.0
     * @private
     */
    var _isCharArrow = function (event) {
        return event.key.toLowerCase().indexOf('arrow') === 0;
    };


    /**
     * Returns the HTML of the cleaned-up code (deletes unnecessary HTML tags).
     * @method WriteAndTag._getCleanHtml
     * @param {boolean} [decode_entities=false] - Decodes HTML entities
     * @returns {string}
     * @since 0.1.0
     * @private
     */
    var _getCleanHtml = function (decode_entities) {
        var html = '<div>' + $('.container').html() + '</div>';
        var obj = $(html);

        obj.find("*").not("span[data-writeandtag='true']:not(:empty)").each(function() {
            $(this).replaceWith(this.innerHTML);
        });

        var result = obj.html();
        result = result.replace(/\n/g, '');
        if (typeof decode_entities=='undefined' || decode_entities)
            result = result.replace(/(&nbsp;)/g, ' ');

        return result;
    };


    return {

        /**
         * Sets the list of tags to be recognized with their respective autocomplete values
         * and calls the `_start()` method which checks if we have all the necessary data to start processing.
         * @method WriteAndTag.setTags
         * @param {Object[]} tags - List of tags and autocomplete values
         * @since 0.1.0
         */
        setTags : function (tags) {
            _setTags(tags);
        },

        /**
         * Sets the jQuery selector of the <div> on which the user will write the text
         * and calls the `_start()` method which checks if we have all the necessary data to start processing.
         * @method WriteAndTag.setContainer
         * @param {string} container - jQuery selector
         * @since 0.1.0
         */
        setContainer : function (container) {
            _setContainer(container);
        },

        /**
         * Activates or deactivates the alphabetical sorting of the items in the autocomplete menu (default: active).
         * @method WriteAndTag.setSorting
         * @param {boolean} [sorting=true] - Set `false` if you want to preserve the original ordering of your list
         * @since 0.1.0
         */
        setSorting : function (sorting) {
            _setSorting(sorting);
        },

        /**
         * Sets a character or string to use as tag separator (default: a space).
         * @method WriteAndTag.setTagSeparator
         * @param {string} tag_separator - A separator
         * @since 0.1.0
         */
        setTagSeparator : function (tag_separator) {
            _setTagSeparator(tag_separator);
        },

        /**
         * Returns the plain text content including tags and cleared of all HTML code.
         * @method WriteAndTag.getPlainText
         * @returns {string}
         * @since 0.1.0
         */
        getPlainText : function () {
            return _getPlainText();
        },

        /**
         * Returns textual content including tags and HTML code.
         * @method WriteAndTag.getHtml
         * @returns {string}
         * @since 0.1.0
         */
        getHtml : function () {
            return _getHtml();
        },

        /**
         * Returns a JSON representing all the structured text and tags.
         * @method WriteAndTag.getJson
         * @returns {Object}
         * @since 0.1.0
         */
        getJson : function () {
            return _getJson();
        }
	};
};
