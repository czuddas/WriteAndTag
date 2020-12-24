jQuery WriteAndTag
==========
WriteAndTag is a Javascript class that allows you to
write text and recognize custom multiple tags inside it.  
Requires jQuery and jQuery UI.

Version 0.1.0 __(beta)__

Usage
-------
Tags consist of two main parts:

* A character used as an identifier;
* A list of elements described by a value and a label.

Each of these entities is a __group of tags__.

### Defining the groups of tags
You can define multiple groups identified by different characters
by building a JSON array with this structure:

```javascript
var tags = [
    {
        // The identifying character
        'tag': '...',

        // List of elements that can be selected as tags
        'autocomplete' : [
            {
                value: "value1",
                label: "My label 1"
            },
            {
                value: "value2",
                label: "My label 2"
            }
        ]
    }
];
```

For example, if the user types `@My label 1` it is tagged as `value1`.

Each object within the main array represents a group of tags;
of course you can define as many groups as you want by identifying them with different characters.

The following example contains three groups of tags:
the first is identified by `@`, the second by `#`
and the third by `.` (dot):

```javascript
var tags = [
    {
        'tag': '@',
        'autocomplete' : [
            {
                value: "value1",
                label: "My label 1"
            },
            {
                value: "value2",
                label: "My label 2"
            }
            // ...
        ]
    },

    {
        'tag': '#',
        'autocomplete' : [
            {
                value: "value3",
                label: "My label 3"
            },
            {
                value: "value4",
                label: "My label 4"
            }
            // ...
        ]
    },
    
    {
        'tag': '.',
        'autocomplete' : [
            // ...
        ]
    }
];
```

### Class initialization
Put a `<div>` in your HTML page and use it as a writing area:

```html
<div class="container"></div>
```

The `<div>` will automatically be made "editable" by WriteAndTag.

Then initialize an instance of `WriteAndTag` class and set
the following minimum configurations:

```javascript
var wt = new WriteAndTag();
wt.setTags(tags);
wt.setContainer('.container');
```

The `setTags` method sets the list of tag groups,
and the `setContainer` method indicates which `<div>`
to use as a writing area.

Then you can use one of the "get" methods to retrieve
the tags written by the user: `getPlainText`, `getHtml` and `getJson`.

### Public methods
#### setTags
Sets the list of tags to be recognized, and their respective autocomplete values.  
It is mandatory.

Example:
```javascript
var tags = [...];
wt.setTags(tags);
```

#### setContainer
Sets the jQuery selector of the `<div>` on which the user will write the text.  
It is mandatory.

Example:
```javascript
wt.setContainer('.container');
```

#### setSorting
Activates or deactivates the alphabetical sorting of the items in the autocomplete menu (default: active).

If disabled, the items will be displayed in the order they were defined in the array.

Example:
```javascript
wt.setSorting(false);
```

#### setTagSeparator
Sets a character or string to use as tag separator (default: a space).

Example:
```javascript
wt.setTagSeparator('; ');
wt.setTagSeparator(' - ');
wt.setTagSeparator(' [what you want] ');
```

#### getPlainText
Returns the plain text content including tags and cleared of all HTML code.

Example:
```javascript
var my_tags = wt.getPlainText();
```

Assuming we have three types of tags (`@` for cities,
`#` for countries and `.` for food), it returns
something like this:

```text
@Rome is in #Italy, the homeland of .Pizza
```

#### getHtml
Returns textual content including tags and HTML code.

Example:
```javascript
var my_tags = wt.getHtml();
```

Returns something like this:

```html
<span data-writeandtag="true" data-writeandtag-tag="@" data-writeandtag-value="a1">@Rome</span> is in <span data-writeandtag="true" data-writeandtag-tag="#" data-writeandtag-value="b1">#Italy</span>, the homeland of <span data-writeandtag="true" data-writeandtag-tag="." data-writeandtag-value="c2">.Pizza</span>
```

Each tag is identified by a `<span>` that has these attributes:

1. `data-writeandtag-tag` contains the identifier character; 
2. `date-writeandtag-value` contains the value of the tag (is the attribute `value` of tag groups array).


#### getJson
Returns a JSON representing all the structured text and tags.

Example:
```javascript
var my_tags = wt.getJson();
```

Returns something like this:

```javascript
[
    {
        "plainText" : "Rome",
        "tag" : {
            "char" : "@",
            "value" : "a1",
            "fullTag" : "@Rome"
        }
    },
    {
        "plainText" : " is in "
    },
    {
        "plainText" : "Italy",
        "tag" : {
            "char" : "#",
            "value" : "b1",
            "fullTag" : "#Italy"
        }
    },
    {
        "plainText" : ", the homeland of "
    },
    {
        "plainText" : "Pizza",
        "tag" : {
            "char" : ".",
            "value" : "c2",
            "fullTag" : ".Pizza"
        }
    }
]
```

Each object in the JSON array represents a piece of text with
the eventual tag, and follows the same sequence as the text
typed by the user.

Scrolling through the array sequentially you can
reconstruct the initial content.

TODO
-------
* Tag editing functionality.
* Immediate display of the tag list upon insertion of the first character.
* Some fixes (especially on Mozilla Firefox).