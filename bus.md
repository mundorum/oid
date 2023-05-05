# Bus Publish/Subscribe Development Guide

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