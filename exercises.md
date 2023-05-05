# Exercises

## Exercise of Three Connected Oids

Instantiate two button components (button-oid) connected to a switch component (switch-oid). The first button turns the switch on and the second off.

## Exercise `bar-oid`

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