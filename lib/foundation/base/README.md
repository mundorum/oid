# Oid Development Guide

An Oid is a technology that enables the packaging of blocks of software and media inside components by using the Digital Content Component (DCC) model. These components can be customized and combined to solve small tasks; interact with a user; perform animations and simulations; or create applications.

# Oid in Pages

## Instantiating and customizing Oids

The first step involves instantiating an Oid. This process involves selecting a Oid from our library and creating an instance from it. You may imagine that each Oid from our library is a template or blueprint to create distinct “individuals” or objects that follow this blueprint. We call this process *instantiation*.

All instantiation follows the same procedure. It takes the following general form:

~~~html
<x-oid property_1="value_1" ... property_n="value_n"><x-oid>
~~~

Where `<x-oid>` is the Oid from the library that you want to instantiate. Each Oid can be customized, while it is instantiated, by defining values to its properties, which take the form of HTML attributes. The available properties depend on the selected Oid.

The following example shows an instantiation of a `<button-oid>`:

~~~html
<button-oid label="Start"
            value="The dinosaur jumped into the mud.">
</button-oid>
~~~

## Publishing/Subscribing Messages

Components can work together exchanging *messages*. Oids support a method publish/subscribe, in which a component publishes a message and another component subscribes to it to receive the message. This message can have two roles: (i) it can activate some action in the target component; (ii) it can carry data from the first component to the second.

Each message is labeled by a *topic*, which is the basis of the publish/subscribe mechanism. The first component publishes the message in a topic T and the second component subscribes to the respective topic T to receive the message.

### Publishing (attribute `publish`)

A message publication starts from a notice, which is an internal Oid event that is notified. This notice can be converted into a published topic by the following statement:

~~~html
publish="notice~topic"
~~~

* `notice`: the event internally notified
* `topic`: the topic published when the notice happens

The published message content depends on the component. See the following example of a `button-oid` publishing a message:

~~~html
<button-oid label="Start"
            value="The dinosaur jumped into the mud."
            publish="click~show/message">
</button-oid>
~~~

A `button-oid` produces a clickable button that can send a message when it is clicked. The following example shows a `button-oid` with a label `Start` that publishes a message when it is clicked. The message will have the topic `show/message` and the content `The dinosaur jumped into the mud.`:

A button-oid always sends its value attribute in the message value.

### Subscribing (`subscribe` attribute)

An Oid can subscribe to a topic by adding an attribute subscribe in the following format:

~~~html
subscribe="topic~notice"
~~~

* `topic` - the topic of the message subscribed
* `notice` (optional) - the external subscribed message can be mapped to an internal notice related to an action

In the following example, we added a second Oid, the `console-oid`, which presents a console that shows the message `The dinosaur jumped into the mud.` when the button with the label `Start` is triggered:

~~~html
<console-oid prompt="*"
             subscribe="show/message~display">
</console-oid>
~~~

The `button-oid` publishes a topic `show/message` and the message `The dinosaur jumped into the mud.` when the button is clicked. The `console-oid` subscribes to the `show/message` message, i.e., it receives the message whenever it is published on the bus. The `show/message` message is mapped to the internal `display` notice that has an associated action of showing the received message.

# JavaScript Developement Guide

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

# Publish/Subscribe Messages

Components work together by exchanging messages. A message bus, which is part of the framework, delivers these messages. When the framework starts, it instantiates a default global message bus. If not indicated otherwise, the default message bus links all Oids.

## Publish

The primary way to publish messages on the bus is the `publish` (or `_publish` inside an Oid) method:

~~~javascript
<reference>.publish(topic, message)
~~~

With the following arguments:
* `topic` - the topic of the message
* `message` - message body - a JSON object

`<reference>` is an instance of a bus that can be achieved in several ways, as further described.

## Subscribe

The primary way to subscribe to messages on the bus is the `subscribe` (or `_subscribe` inside an Oid) method:

~~~javascript
<reference>.subscribe(topic, handler)
~~~

With the following arguments:
* `topic` - the topic of the message
* `handler` - the function that will handle the message

Whenever the component receives a message of a given subscribed topic, it dispatches it to the handler function or method, with two parameters: topic and message.

## Publishing a message by an Oid

An Oid publishes a message on the bus through the following statement:

~~~javascript
this._publish(topic, message)
~~~

Every Oid inherits the `_publish` method from the DCC Base, which in turn calls the `publish` method from the bus.

## Subscribing a message by an Oid

An Oid subscribes a message on the bus through the following statement:

~~~javascript
this._subscribe(topic, handler)
~~~

Every Oid inherits the `_subscribe` method from the Oid Base, which in turn calls the `subscribe` method from the bus. If the handler is a method, we suggest the following format:

~~~javascript
this._subscribe(topic, this.method.bind(this))
~~~

This binding technique assures that the instance of the object will follow the method when it is called.

# Publishing/Subscribing messages outside an Oid

Any javascript code outside an Oid can publish or subscribe to messages on the bus through the following statements:

~~~javascript
Bus.i.publish(topic, message)
Bus.i.subscribe(topic, handler)
~~~

`Bus.i` represents a default instance of a message bus. It is a static attribute created with the class.