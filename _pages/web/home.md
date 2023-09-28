---
layout: single-oid
title: Oids Inside a Web Page
permalink: /web/
---

<!-- Jekyll directive to avoid Liquid filters
{% raw %}
-->

<oid-sphere stylesheet="/oid/assets/css/oidclasses.css" assets="/oid/assets/images/tutorial/" global>
</oid-sphere>

An Oid is a technology that enables the packaging of blocks of software and media inside components by using the Digital Content Component (DCC) model. These components can be customized and combined to solve small tasks; interact with a user; perform animations and simulations; or create applications.

# Oid in Pages

## Instantiating and customizing Oids

The first step involves instantiating an Oid. This process involves selecting a Oid from our library and creating an instance from it. You may imagine that each Oid from our library is a template or blueprint to create distinct “individuals” or objects that follow this blueprint. We call this process *instantiation*.

All instantiation follows the same procedure. It takes the following general form:

~~~html
<x-oid property_1="value_1" ... property_n="value_n"><x-oid>
~~~

Where `<x-oid>` is the Oid from the library that you want to instantiate. Each Oid can be customized, while it is instantiated, by defining values to its properties, which take the form of HTML attributes. The available properties depend on the selected Oid.

The following example shows an instantiation of a `<dcc-slider>`:

<p>
<oid-play>
   <slider-oid></slider-oid>
</oid-play>
</p>

This tutorial is alive, i.e., the examples presented are real Oids that you can interact with. On top of these DCCs, it is presented the HTML expression that generates it. Sometimes, a panel of `Messages on the Bus` is activated below these DCCs to unveil the messages on the DCC Message Bus.

You can try it yourself by modifying the expression and clicking on the [render] button to verify the results.

This Oid presents a slider on the screen. Four properties can be customized:
* `min` - minimal value accepted;
* `max` - maximal value accepted;
* `value` - current value of the slider;
* `index` - defines if the index is presented besides the slider.

This is an example of a customized Slider DCC:

<p>
<oid-play>
   <slider-oid min="0" max="100" value="30" index></slider-oid>
</oid-play>
</p>

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

<p>
<oid-play messages>
  <button-oid label="Talk"
              publish="click~show/message"
              value="Graauuuurrrr">
  </button-oid>
</oid-play>
</p>

A `button-oid` produces a clickable button that can send a message when it is clicked. The following example shows a `button-oid` with a label `Talk` that publishes a message when it is clicked. The message will have the topic `show/message` and the content `Graauuuurrrr`:

A button-oid always sends its value attribute in the message value.

### Subscribing (`subscribe` attribute)

An Oid can subscribe to a topic in such a way that whenever a message with the respective topic appears on the bus, it will receive the message. It subscribes to a topic by adding an attribute subscribe in the following format:

~~~html
subscribe="topic~notice"
~~~

* `topic` - the topic of the message subscribed
* `notice` (optional) - the external subscribed message can be mapped to an internal notice related to an action

In the following example, we added a second Oid, the `lively-talk-oid`, which presents a character that shows the message `I am a terrible dinosaur!` when the button with the label `Talk` is triggered:

<p>
<oid-play messages>
  <button-oid label="Talk"
    value="I am a terrible dinosaur!"
    publish="click~show/message">
  </button-oid>

  <lively-talk-oid subscribe="show/message~display">
  </lively-talk-oid>
</oid-play>
</p>

The `button-oid` publishes a topic `show/message` and the message `I am a terrible dinosaur!` when the button is clicked. The `lively-talk-oid` subscribes to the `show/message` message, i.e., it receives the message whenever it is published on the bus. The `show/message` message is mapped to the internal `display` notice that has an associated action of showing the received message.

### Playground Editor

You can also try by yourself in a complete experimentation setup that we call [Playground Editor](https://mundorum.github.io/oid/oid/playground/editor/). You can write complete Oid compositions, render them and track the messages sent in the Bus.

### Multiple publications and subscriptions

Oids can publish and subscribe to several topics and messages. Semicolons separate several publications or subscriptions.

The following example shows a slider publishing two messages:

<p>
<oid-play messages>
  <lively-talk-oid
    speech="My age is {{}} years."
    subscribe="show/message~display">
  </lively-talk-oid>
  <slider-oid index publish="initial~show/message;change~show/message">
  </slider-oid>
</oid-play>
</p>

It is important to notice two characteristics:
* the slider is publishing the topic "`show/message`" related to two internal notices:
  * `initial` - triggered when the slides set its initial value;
  * `change` - triggered whenever the slider value changes;
* the speech property added an `{{}}` expression inside the message to indicate where to insert the display value.

The following example shows two subscriptions of two buttons. The first one (label `Talk`) triggers the message `Graauuuurrrr` and the second one (label `Clear`) clears the message.

<p>
<oid-play messages>
  <lively-talk-oid subscribe="dino/talk~display;dino/clear~clear">
  </lively-talk-oid>

  <button-oid label="Talk"
    value="Graauuuurrrr"
    publish="click~dino/talk">
  </button-oid>
  <button-oid label="Clear"
    publish="click~dino/clear">
  </button-oid>
</oid-play>
</p>

### Selective Publish/Subscribe

#### Topic Filters and Wildcards

In the subscription process, it is possible to specify a specific Topic Name or a Topic Filter, which works as a regular expression representing a set of possible Topic Names.

Wildcards are represented by the special `#` and/or `+` characters, appearing inside a Topic Name in the subscription process. They enable the subscription of a set of topics, since they generically represent one or more Topic Levels, according to the following rules:

#### Multilevel Wildcard `#`
The wildcard `#` can be used only in two positions in the Topic Filter:
* alone (the filter is only a `#`) - matches any Topic Name with any number of levels;
* end of the Topic Name (always preceded by a `/ `) -  matches any number of Topic Levels with the prefix specified before the wildcard.

#### Single Level Wildcard `+`
Only a single Topic Level can be matched by the wildcard  `+`, which represents any possible complete Topic Level Label. The `+` wildcard can appear only in four positions:
* alone (the filter is only a `+`) - matches any Topic Label in a single level (without slashes);
* beginning of the Topic Filter, always followed by a slash;
* end of the Topic Filter, always preceded by a slash;
* middle of the Topic Filter, always between two slashes.

The following example show messages selectively displayed.

<p>
<oid-play>
  <button-oid label="Disease" publish="click~news/disease" value="dengue symptoms">
  </button-oid>
  
  <button-oid label="Drug" publish="click~news/drug" value="coronavirus vaccine">
  </button-oid>
  
  <button-oid label="Dinosaur" publish="click~news/dinosaur" value="brazilian dinosaurs">
  </button-oid>
  
  <lively-talk-oid character="assets:images/doctor.png" speech="I heard about: " subscribe="news/#~display">
  </lively-talk-oid>

  <lively-talk-oid character="assets:images/nurse.png" speech="I heard about: " subscribe="news/disease~display">
  </lively-talk-oid>

  <lively-talk-oid character="assets:images/patient.png" speech="I heard about: " subscribe="+/dinosaur~display">
  </lively-talk-oid>
</oid-play>
</p>

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

<!-- Jekyll directive to avoid Liquid filters
{% endraw %}
-->