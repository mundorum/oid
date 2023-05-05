# Exercises

## Exercise of Two Connected Oids

Instantiate one button component (button-oid) connected to a switch component (switch-oid). When the user clicks this button it turns the switch on and off alternately.

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