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

# Console Oid (`<console-oid>`)

Show a console-like display on the page and present messages in it.

## Properties

property  | role     | default
----------| -------- | -------
`prompt` | customize the prompt preceding each message | `>`

## Input Notices

notice    | action  | message | message type
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

# Image Oid (`<image-oid>`)

Show an image from an external file. This image can generate interaction-related messages.

## Properties

property  | role     | default
----------| -------- | -------
`source`  | path to the image file | `assets:images/image.svg`
`label`   | title or label of the image, presented as alternate (alt) in HTML |

## Output Notices

notice       | action  | message | message type
-------------| --------| ------- | ------------
`click`      | the user clicks the mouse over the image | the `label` property; if it is not defined, the `source` | `SingleValue`
`mouseenter` | the user enters the mouse pointer into the image area | the `label` property; if it is not defined, the `source` | `SingleValue`
`mouseleave` | the user leaves the mouse pointer from the image area | the `label` property; if it is not defined, the `source` | `SingleValue`

<p>
<oid-play>
  <image-oid source="assets:images/doctor.png" label="Doctor"></image-oid>
</oid-play>
</p>

<p>
<oid-play messages>
  <image-oid source="assets:images/nurse.png" label="Nurse" publish="mouseenter~nurse/image"></image-oid>
  <image-oid source="assets:images/patient.png" label="Patient" publish="click~patient/click"></image-oid>
</oid-play>
</p>

# Button Oid (`<button-oid>`)

Show a button on the page that publishes a message for each interaction (e.g., click).

## Properties

property  | role     | default
----------| -------- | -------
`label`   | Label presented inside the button. |
`value`   | Value of the button -- published inside messages. |
`tooltip` | Extra information presented when the user moves the mouse over the button (future). |

## Output Notices

notice       | action  | message | message type
-------------| --------| ------- | ------------
`click`      | the user clicks the mouse over the button | the `value` property; if it is not defined, the `label` | `SingleValue`
`mouseenter` | the user enters the mouse pointer into the button area | the `value` property; if it is not defined, the `label` | `SingleValue`
`mouseleave` | the user leaves the mouse pointer from the button area | the `value` property; if it is not defined, the `label` | `SingleValue`

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

notice       | action  | message | message type
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

notice       | action  | message | message type
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

# Submit Oid (`<submit-oid>`)

Collects the data of a `<form>` and dispatches it as a JSON message. The `<submit-oid>` must be declared inside the target `<form>`.

## Input Notices

notice   | action  | message | message type
---------| --------| ------- | ------------
`submit` | triggers the collection of the form data to submit it as a message  | `empty` | `empty`
`update` | update form fields with data sent | field values to be updated in the form | `JSON`

## Output Notices

notice       | action  | message | message type
-----------| --------| ------- | ------------
`submit`   | the values of the fields collected from the form | field names and values | `JSON`
`dispatch` | the values of the fields collected from the form | `value` field with an inner object containing field names and values; `error` field for error  | `JSON`


# RSS Oid (`<rss-oid>`)

Fetches items from an RSS feed and presents them or publishes them as messages on the bus.

## Properties

property  | role     | default
----------| -------- | -------
`source`   | the source of the RSS feeds |
`autorun`  | defines if the component will fetch the feed on start | `false`

## Input Notices

notice   | action  | message | message type
---------| --------| ------- | ------------
`next`   | publishes one RSS item (the next in a sequence)  | `empty` | `empty`

## Output Notices

notice       | action  | message | message type
-----------| --------| ------- | ------------
`dispatch` | return the content of one feed | contains the `title`, `link` to the feed, and link to the `image`, plus a field `value` with these fields in HTML.  | `JSON`

## Example

<p>
<oid-play messages>
  <rss-oid source="https://www.wired.com/category/science/feed"
           autorun>
  </rss-oid>
<oid-play messages>
</p>

<!-- Jekyll directive to avoid Liquid filters
{% endraw %}
-->