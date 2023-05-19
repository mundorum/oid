# Page

## Oid Inside a Page - Development Guide

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

## Connecting Oids

Oids can interact through connections. Each connection is a one-to-one relationship between two components, mediated by an interface. Every interface has an id and defines a set of operations. Consider the following interface meant to transfer data from one component to another:

* Interface id: `itf:transfer`
  * Operation:
    * `send`: sends data from a source to a target component

To connect the two components, the first requirement is that one assumes the role of requesting the service and the second the role of providing the service.

Consider the example of a file component that can read a text file and send it to be presented in a console. The `file-oid` component is prepared to send data through the `itf:transfer` interface, while de `console-oid` is prepared to receive this data and show it in the console. The one who calls the operation is the component that requests the service (`file-oid`); the one who handles the operation request is the provider (`console-oid`). The component that requests the service must first connect to the provider through the following sentence:

~~~html
<requester-oid connect="interface_id#component_id">
</requester-oid>

<provider-oid id="component_id">
</provider-oid>
~~~

* `interface_id`: the id of the interface that mediates the service
  * `component_id`: the id of the component and provides the service

Consider the example:

~~~html
<file-oid connect="itf:transfer#presenter">
</file-oid>

<console-oid id="presenter" prompt="">
</console-oid>
~~~

The `file-oid` was connected to the `console-oid` through the interface `itf:transfer`. Both components are prepared to use the interface in such a way that, whenever the user clicks on the button, it sends the value (Asdrubal) to the console-oid.