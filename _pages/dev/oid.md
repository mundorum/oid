---
title: Oid Developement Guide
permalink: /dev/
---

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
  provide: ['itf:transfer'],
  stylesheet: ['../imported-styles.css'],
  styles: css`
    .myclass {
      color: blue;
    }`,
  stylable: true,
  template: html`<h1 class="myclass">Hello, {{this.name}}</h1>`,
  receive: ['test'], // {'test': 'handleTest'}
  implementation: OidSample
})
~~~

* `id`: unique id of the Oid
* `element`: the label of the HTML element, if it is a web component
* `base`: base component class - extended in this component
* `implementation`: the predefined class that implements the component
* `properties`: properties to be attached to the component
  * `default`: default value assigned to the property in the beginning
* `provide`: list of interfaces provided by this component (see Connection section)
* `stylesheet`: list of external stylesheet links imported to the local template
* `styles`: locally defined styles applied to the template
* `stylable`: defines the precedence between stylesheet and styles
  * `true` (default) - indicates that stylesheet overrides styles
  * `false` - vice-versa
* `template`: HTML/SVG/XML template to render
* `receive`: list of the notices treated by handled by the component
  * *array format*: lists only the supported notices, automatically mapped to  `handleNotice` handler
  * *object format*: lists the supported notices and the respective handler
* `implementation`: name of the class that implements extra code for the component, when it is necessary 

An example of a basic component (see the complete code on [GitHub](https://github.com/mundorum/oid/tree/main/src/playground/learning/02-development/02-oid/001-basic)):

~~~js
Oid.component(
{
  id: 'ex:basic',
  element: 'basic-oid',
  properties: {
    name: {}
  },
  template: `<h1>Hello, {{this.name}}</h1>`
})
~~~

An example of a component with a provided interface and extra code (see the complete code on [GitHub](https://github.com/mundorum/oid/blob/main/src/playground/learning/02-development/02-oid/202-2-provide-interface/hello-oid.js)):

~~~js
export class HelloOid extends OidUI {
  handleSend (topic, message) {
    this.name = message.value
  }
}

Oid.component(
{
  id: 'ex:hello',
  element: 'hello-oid',
  properties: {
    name: {default: 'nobody'}
  },
  provide: ['itf:transfer'],
  template: html`<h1>Hello, {{this.name}}</h1>`,
  implementation: HelloOid
})
~~~

# Notice -> Publish -> Subscribe -> Notice

All components' communication follows the path `notice -> publish -> subscribe -> notice`, as illustrated in the following figure.

![Notice Publish-Subscribe Notice](images/notice-publish-subscribe-notice.png)

## Step 1: Notifying a Notice

An Oid triggers notices, which will be converted into publications if there is a mapping clause (`publish=""`) in the instantiation:

~~~javascript
this._notify(notice, message)
~~~

# Dynamic Template

Templates can be defined in the class as a `template` method, as follows (see the complete code on [GitHub](https://github.com/mundorum/oid/tree/main/src/playground/learning/02-development/03-extras/dynamic-template-2)):

~~~js
import { html, Oid, OidUI } from '/lib/oidlib-dev.js'

export class BarOid extends OidUI {
  template () {
    return html`${this.char.repeat(this.size)}`
  }
}

Oid.component(
{
  id: 'ex:bar',
  element: 'bar-oid',
  properties: {
    char: {default: '-'},
    size: {default: '10'}
  },
  implementation: BarOid
})
~~~

This `template` method can use all features of [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), including calling methods to compute values, as shows the example.