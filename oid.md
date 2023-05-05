# Oid Developement Guide

This guide shows how to build new Oids in JavaScript.

# Definition

~~~js
Oid.component(
{
  id: 'ex:sample',
  element: 'sample-oid',
  properties: {
    name: {default: 'World'}
  },
  template: `<h1>Hello, {{this.name}}</h1>`,
  receive: ['test'] // {'test': 'handleTest'}
})
~~~

* `id`: unique id of the Oid
* `element`: the label of the HTML element, if it is a web component
* `base`: base component class - extended in this component
* `implementation`: the predefined class that implements the component
* `properties`: properties to be attached to the component
  * `default`: default value assigned to the property in the beginning
* `template`: HTML/SVG/XML template to render
* `receive`: list of the notices treated by handled by the component
  * *array format*: lists only the supported notices, automatically mapped to  `handleNotice` handler
  * *object format*: lists the supported notices and the respective handler

## Publishing a notice/message by an Oid

An Oid triggers notices, which will be converted into publications if there is a mapping clause (`publish=""`) in the instantiation:

~~~javascript
this._notify(notice, message)
~~~
