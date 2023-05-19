# Connections

Oids can interact through connections. Each connection is a one-to-one relationship between two components, mediated by an interface.

# Interfaces

Every interface is a contract between two components, which specifies which operations are part of this contract and how they work. Interfaces are defined independently from oids since they are mediators between them. The method interface defines an interface as follows:

~~~js
Oid.cInterface(
{
  id: 'ex:sample',
  operations: {
    oper1: {
      response: true,
      handler: 'handlerOper1'
    },
    oper2: {
      response: false
    }
  },
  cardinality: '1:n'
})
~~~

* `id`: unique id of the interface
* `operations`: list of operations defined in this interface
  * *array format*: lists only the operation labels; all parameters will be in the default value
  * *object format*: lists labels and specify parameters
    * `response`: indicates if the operation will return a value (optional - default is false)
    * `handler`: name of the handler method to this operation (optional - if not specified, the operation method is handler)

These are two examples of interfaces:

~~~js
Oid.cInterface ({
  id: 'itf:transfer',
  operations: ['send'],
  cardinality: 'n:n'
})

Oid.cInterface ({
  id: 'itf:iterate',
  operations: {
    'first': {response: true},
    'next': {response: true}
  },
  cardinality: '1:n'
})
~~~

Available in the [learning section](https://github.com/mundorum/oid/tree/main/src/playground/learning/02-development/02-oid/202-2-provide-interface):

~~~js
Oid.cInterface ({
  id: 'exitf:inform',
  operations: {
    'arrive': {
      response: true,
      handler: 'someoneArrives'
    }
  },
  cardinality: 'n:n'
})
~~~

# Default -o-id Interface

All components have a default interface defined as follows:

~~~js
Oid.cInterface ({
  id: 'itf:oid',
  operations: {
    'get': {response: true},
    'set': {response: false}
  },
  cardinality: 'n:n'
})
~~~

For now, this interface has two operations:

* `get` - returns the value of a property informed in the body of the message (`property` field);
* `set` - sets a property with a value, both informed in the message (`property` and `value` fields).

The following example shows the invocation of two gets (`char` and `size`). See the complete code on [GitHub](https://github.com/mundorum/oid/tree/main/src/playground/learning/02-development/03-extras/interface-get):

Oids previously connected by the `itf:oid` interface:

~~~js
<bar-oid id="mybar" connect="itf:oid#myparam"></bar-oid>
<parameters-oid id="myparam" char="*" size="10"></parameters-oid>
~~~

Invoking the `get` operation:

~~~js
this.char = await this._invoke('itf:oid', 'get', {property: 'char'})
this.size = await this._invoke('itf:oid', 'get', {property: 'size'})
~~~

The following example shows the invocation of two sets (`char` and `size`).See the complete code on [GitHub](https://github.com/mundorum/oid/tree/main/src/playground/learning/02-development/03-extras/interface-set):

Oids previously connected by the `itf:oid` interface:

~~~js
<customizer-oid connect="itf:oid#mybar"></customizer-oid>
<bar-oid id="mybar"></bar-oid>
~~~

Invoking the `set` operation:

~~~js
this._invoke('itf:oid', 'set', {property: 'char', value: '*'})
this._invoke('itf:oid', 'set', {property: 'size', value: '10'})
~~~