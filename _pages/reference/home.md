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

property  | role
----------| --------
`label`   | label presented inside the button
`value`   | value of the button -- published inside messages
`tooltip` | extra information presented when the user moves the mouse over the button

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

property  | role
----------| --------
`value`   | initial value for the slider; if it is not defined, the initial value will be ibetween `min` and `max`
`min`     | minimal value accepted
`max`     | maximal value accepted
`index`   | defines if the index is presented besides the slider

## Output Notices

notice       | source  | message | message type
-------------| --------| ------- | ------------
`initial`    | the slider defines its initial value | initial value | `SingleValue`
`change`     | the slider changes the current value - the user slides the slider | current value | `SingleValue`

## Example

<p>
<oid-play>
   <slider-oid min="0" max="100" value="30" index></slider-oid>
</oid-play>
</p>

# Console Oid (`<console-oid>`)

Show a console-like display on the page and present messages in it.

## Properties

property | role
---------| --------
`prompt` | customize the prompt preceding each message; default is `>`

## Input Notices

notice    | source  | message | message type
----------| --------| ------- | ------------
`display` | displays a message in the console | the value to display | `SingleValue`
`clear`   | clear all console messages | `empty` | `empty`

<!-- Jekyll directive to avoid Liquid filters
{% endraw %}
-->