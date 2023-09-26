---
title: Exercises
permalink: /dev/exercises/
---

## 1. Exercise of Two Connected Oids

Instantiate one button component (button-oid) connected to a switch component (switch-oid). When the user clicks this button it turns the switch on and off alternately.

## 2. Exercise `bar-oid`

Write an Oid named `bar-oid` that draws a bar made from characters. It defines two properties:

* `char`: character used to draw the bar;
* `size`: number of characters of the bar.

Examples:

HTML:
~~~html
<bar-oid char="*" size="10"></bar-oid>
~~~

Result:
~~~
**********
~~~

HTML:
~~~html
<bar-oid char="#" size="15"></bar-oid>
~~~

Result:
~~~
###############
~~~

## 3. Exercise `increase-oid`

Write an Oid that shows the text "`Increase X`". When the user clicks on it the component sends a message with the value of X to the bus. X is a value informed in a property named `rate`.

Upgrade the component of the previous exercise to receive a message with a numeric value and increase the size of the bar with the respective value.

Example:

HTML:
~~~html
<increase-oid rate="5" publish="click~increase/bar"></increase-oid>
<bar-oid char="*" size="10" subscribe="increase/bar~increase"></bar-oid>
~~~

Result:
~~~
Increase 5
**********
~~~

Every time the user clicks on the message "Increase 5" the bar size increases by 5 characters.