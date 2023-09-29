---
layout: single-oid
title: Oids Reference
permalink: /reference/
---

<!-- Jekyll directive to avoid Liquid filters
{% raw %}
-->

<oid-sphere stylesheet="/oid/assets/css/oidclasses.css" assets="/oid/assets/images/tutorial/" global>
</oid-sphere>

## Playground

Learn and try to instantiate and customize Oids at [Playground Editor](https://mundorum.github.io/oid/oid/playground/editor/).

# Syntax and Examples

# Button Oid (`<button-oid>`)

Show a button on the page that publishes a message for each interaction (e.g., click).

## Properties

property  | role     | default
----------| -------- | -------
`label`   | Label presented inside the button. |
`value`   | Value of the button -- published inside messages. |
`tooltip` | Extra information presented when the user moves the mouse over the button (future). |

## Output Notices

notice       | source  | message | message type
-------------| --------| ------- | ------------
`click`      | the user clicks the mouse over the button | the value property; if it is not defined, the label | `SingleValue`
`mouseenter` | the user enters the mouse pointer into the button area | the value property; if it is not defined, the label | `SingleValue`
`mouseleave` | the user leaves the mouse pointer from the button area | the value property; if it is not defined, the label | `SingleValue`

## Example

<p>
<oid-play messages>
  <button-oid label="Talk"
              publish="click~show/message"
              value="Graauuuurrrr">
  </button-oid>
</oid-play>
</p>

# Slider Oid (`<slider-oid>`)

An input component presented as a slider.

## Properties

property  | role     | default
----------| -------- | -------
`value`   | Initial value for the slider. | value will be between `min` and `max`
`min`     | Minimal value accepted. | `0`
`max`     | Maximal value accepted. | `100`
`index`   | defines if the index is presented besides the slider | `false`

## Output Notices

notice       | source  | message | message type
-------------| --------| ------- | ------------
`initial`    | the slider defines its initial value | initial value | `SingleValue`
`change`     | the slider changes the current value - the user slides the slider | current value | `SingleValue`

## Example

<p>
<oid-play messages>
   <slider-oid min="0" max="100" value="30" index publish="initial~show/message;change~show/message"></slider-oid>
</oid-play>
</p>

# Switch Oid (`<switch-oid>`)

An input component presented as a switch.

## Properties

property  | role     | default
----------| -------- | -------
`value`   | Initial value for the switch. Value "off" sets switch off and any other value on. | `off`
`on`      | Value to be dispatched in the message when the switch is on. | `on`
`off`     | Value to be dispatched in the message when the switch is on. | `off`

## Output Notices

notice       | source  | message | message type
-------------| --------| ------- | ------------
`initial`    | the switch defines its initial value | initial value | `SingleValue`
`change`     | the switch changes the current value - the user slides the switch | current value | `SingleValue`

## Example

<p>
<oid-play messages>
  <switch-oid on="switched on" off="switched off" value="on" publish="initial~show/message;change~show/message">
  </switch-oid>
</oid-play>
</p>

# Console Oid (`<console-oid>`)

Show a console-like display on the page and present messages in it.

## Properties

property  | role     | default
----------| -------- | -------
`prompt` | customize the prompt preceding each message | `>`

## Input Notices

notice    | source  | message | message type
----------| --------| ------- | ------------
`display` | displays a message in the console | the value to display | `SingleValue`
`clear`   | clear all console messages | `empty` | `empty`

<p>
<oid-play>
  <button-oid label="Start"
              value="The dinosaur jumped into the mud."
              publish="click~show/message">
  </button-oid>

  <console-oid prompt="*"
               subscribe="show/message~display">
  </console-oid>
</oid-play>
</p>

<!-- Jekyll directive to avoid Liquid filters
{% endraw %}
-->