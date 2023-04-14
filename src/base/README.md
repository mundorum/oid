

~~~js
Oid.component(
{
  id: 'ex:sample',
  element: 'sample-oid',
  properties: {
    name: {default: 'World'}
  },
  template: `<h1>Hello, {{this.name}}</h1>`,
  notify: ['test'] // {'test': 'notifyTest'}
})
~~~

* `id`: unique id of the DCC
* `element`: the label of the HTML element, if it is a web component
* `base`: base component class - extended in this component
* `implementation`: the predefined class that implements the component
* `properties`: properties to be attached to the component
  * `default`: default value assigned to the property in the beginning
* `template`: HTML/SVG/XML template to render
* `notify`: list of the notices treated by handled by the component
  * *array format*: lists only the supported notices, automatically mapped to  notifyNotice handler
  * *object format*: lists the supported notices and the respective handler