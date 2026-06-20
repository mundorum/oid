import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { Bus } from '../../src/infra/bus.js'

// Each test gets a fresh Bus instance so there is no state bleed.

describe('Bus - publish/subscribe', () => {
  let bus

  beforeEach(() => { bus = new Bus() })

  // ---------------------------------------------------------------------------
  // Basic messaging
  // ---------------------------------------------------------------------------

  describe('basic messaging', () => {
    it('subscriber receives message on matching topic', () => {
      let received = false
      bus.subscribe('test/topic', (topic, message) => {
        received = true
        assert.equal(topic, 'test/topic')
        assert.deepEqual(message, { value: 'hello' })
      })
      bus.publish('test/topic', { value: 'hello' })
      assert.ok(received, 'handler was not called')
    })

    it('all subscribers on the same topic receive the message', () => {
      let count = 0
      bus.subscribe('test/topic', () => count++)
      bus.subscribe('test/topic', () => count++)
      bus.publish('test/topic', {})
      assert.equal(count, 2)
    })

    it('subscriber on a different topic does not receive the message', () => {
      bus.subscribe('other/topic', () => assert.fail('should not be called'))
      bus.publish('test/topic', {})
    })

    it('accepts object form { topic: handler }', () => {
      let received = false
      bus.subscribe({ 'test/topic': () => { received = true } })
      bus.publish('test/topic', {})
      assert.ok(received)
    })

    it('delivers multiple sequential publishes in order', () => {
      const received = []
      bus.subscribe('test/topic', (_, msg) => received.push(msg.value))
      bus.publish('test/topic', { value: 1 })
      bus.publish('test/topic', { value: 2 })
      bus.publish('test/topic', { value: 3 })
      assert.deepEqual(received, [1, 2, 3])
    })

    it('publish to topic with no subscribers does not throw', () => {
      assert.doesNotThrow(() => bus.publish('no/subscribers', {}))
    })

    it('subscribe with null handler is silently ignored', () => {
      assert.doesNotThrow(() => bus.subscribe('test/topic', null))
      assert.doesNotThrow(() => bus.publish('test/topic', {}))
    })
  })

  // ---------------------------------------------------------------------------
  // Single-level wildcard  +
  // ---------------------------------------------------------------------------

  describe('wildcard +', () => {
    it('+/topic matches prefix/topic', () => {
      let received = false
      bus.subscribe('+/topic', (topic) => {
        received = true
        assert.equal(topic, 'prefix/topic')
      })
      bus.publish('prefix/topic', {})
      assert.ok(received)
    })

    it('topic/+ matches topic/suffix', () => {
      let received = false
      bus.subscribe('topic/+', (topic) => {
        received = true
        assert.equal(topic, 'topic/suffix')
      })
      bus.publish('topic/suffix', {})
      assert.ok(received)
    })

    it('+/+ matches a/b', () => {
      let received = false
      bus.subscribe('+/+', (topic) => {
        received = true
        assert.equal(topic, 'a/b')
      })
      bus.publish('a/b', {})
      assert.ok(received)
    })

    it('+/dinosaur matches news/dinosaur and report/dinosaur', () => {
      const received = []
      bus.subscribe('+/dinosaur', (topic) => received.push(topic))
      bus.publish('news/dinosaur', {})
      bus.publish('report/dinosaur', {})
      assert.deepEqual(received, ['news/dinosaur', 'report/dinosaur'])
    })

    it('+/topic does not match prefix/topic/extra (extra level)', () => {
      bus.subscribe('+/topic', () => assert.fail('should not match extra level'))
      bus.publish('prefix/topic/extra', {})
    })

    it('+/dinosaur does not match news/dinosaur/brazil', () => {
      bus.subscribe('+/dinosaur', () => assert.fail('should not match nested topic'))
      bus.publish('news/dinosaur/brazil', {})
    })
  })

  // ---------------------------------------------------------------------------
  // Multi-level wildcard  #
  // ---------------------------------------------------------------------------

  describe('wildcard #', () => {
    it('news/# matches news/disease', () => {
      let received = false
      bus.subscribe('news/#', (topic) => {
        received = true
        assert.equal(topic, 'news/disease')
      })
      bus.publish('news/disease', {})
      assert.ok(received)
    })

    it('news/# matches news/drug', () => {
      let received = false
      bus.subscribe('news/#', (topic) => {
        received = true
        assert.equal(topic, 'news/drug')
      })
      bus.publish('news/drug', {})
      assert.ok(received)
    })

    it('news/# matches news/disease/viral (multi-level)', () => {
      let received = false
      bus.subscribe('news/#', (topic) => {
        received = true
        assert.equal(topic, 'news/disease/viral')
      })
      bus.publish('news/disease/viral', {})
      assert.ok(received)
    })

    it('# alone matches any topic', () => {
      let received = false
      bus.subscribe('#', (topic) => {
        received = true
        assert.equal(topic, 'any/nested/topic')
      })
      bus.publish('any/nested/topic', {})
      assert.ok(received)
    })

    it('news/# does not match report/dinosaur', () => {
      bus.subscribe('news/#', () => assert.fail('should not match report/dinosaur'))
      bus.publish('report/dinosaur', {})
    })

    it('exact, + and # subscriptions all fire for a matching topic', () => {
      const received = []
      bus.subscribe('news/disease', () => received.push('exact'))
      bus.subscribe('+/disease', () => received.push('+'))
      bus.subscribe('news/#', () => received.push('#'))
      bus.publish('news/disease', {})
      assert.deepEqual(received.sort(), ['#', '+', 'exact'])
    })
  })

  // ---------------------------------------------------------------------------
  // Unsubscribe
  // ---------------------------------------------------------------------------

  describe('unsubscribe', () => {
    it('unsubscribed handler no longer receives messages', () => {
      const handler = () => assert.fail('should not be called after unsubscribe')
      bus.subscribe('test/topic', handler)
      bus.unsubscribe('test/topic', handler)
      bus.publish('test/topic', {})
    })

    it('remaining handlers on same topic still fire after one unsubscribes', () => {
      let count = 0
      const removed = () => assert.fail('should not be called')
      const kept = () => count++
      bus.subscribe('test/topic', removed)
      bus.subscribe('test/topic', kept)
      bus.unsubscribe('test/topic', removed)
      bus.publish('test/topic', {})
      assert.equal(count, 1)
    })

    it('unsubscribes a + wildcard handler', () => {
      const handler = () => assert.fail('should not be called after unsubscribe')
      bus.subscribe('+/topic', handler)
      bus.unsubscribe('+/topic', handler)
      bus.publish('prefix/topic', {})
    })

    it('unsubscribes a # wildcard handler', () => {
      const handler = () => assert.fail('should not be called after unsubscribe')
      bus.subscribe('news/#', handler)
      bus.unsubscribe('news/#', handler)
      bus.publish('news/disease', {})
    })

    it('unsubscribes via object form { topic: handler }', () => {
      const handler = () => assert.fail('should not be called after unsubscribe')
      bus.subscribe({ 'test/topic': handler })
      bus.unsubscribe({ 'test/topic': handler })
      bus.publish('test/topic', {})
    })
  })
})

// =============================================================================
// Connection-oriented communication
// =============================================================================

describe('Bus - connection-oriented', () => {
  let bus

  beforeEach(() => { bus = new Bus() })

  it('provide then connect calls connectionReady immediately', () => {
    let ready = false
    const provider = { handleInvoke: async () => 'ok' }
    const callback = {
      connectionReady (iface, id, p) {
        assert.equal(iface, 'itf:test')
        assert.equal(id, 'comp1')
        assert.equal(p, provider)
        ready = true
      }
    }
    bus.provide('itf:test', 'comp1', provider)
    bus.connect('itf:test', 'comp1', callback)
    assert.ok(ready)
  })

  it('connect before provide queues callback and fires connectionReady on provide', () => {
    let ready = false
    const provider = { handleInvoke: async () => 'ok' }
    const callback = {
      connectionReady (iface, id, p) {
        assert.equal(p, provider)
        ready = true
      }
    }
    bus.connect('itf:test', 'comp1', callback)
    assert.ok(!ready, 'connectionReady should not fire before provide')
    bus.provide('itf:test', 'comp1', provider)
    assert.ok(ready, 'connectionReady should fire once provide is called')
  })

  it('provide returns true on first registration, false on duplicate', () => {
    const provider = { handleInvoke: async () => 'ok' }
    assert.ok(bus.provide('itf:test', 'comp1', provider))
    assert.ok(!bus.provide('itf:test', 'comp1', provider))
  })

  it('withhold removes a provider and returns true', () => {
    const provider = { handleInvoke: async () => 'ok' }
    bus.provide('itf:test', 'comp1', provider)
    assert.ok(bus.withhold('itf:test', 'comp1'))
  })

  it('withhold on a non-existent provider returns false', () => {
    assert.ok(!bus.withhold('itf:test', 'nonexistent'))
  })

  it('after withhold a new provide is accepted', () => {
    const provider = { handleInvoke: async () => 'ok' }
    bus.provide('itf:test', 'comp1', provider)
    bus.withhold('itf:test', 'comp1')
    assert.ok(bus.provide('itf:test', 'comp1', provider))
  })

  it('invoke calls handleInvoke on provider and returns its result', async () => {
    const provider = {
      handleInvoke: async (iface, notice, msg) => {
        assert.equal(iface, 'itf:test')
        assert.equal(notice, 'send')
        assert.deepEqual(msg, { data: 42 })
        return 'result-value'
      }
    }
    bus.provide('itf:test', 'comp1', provider)
    const result = await bus.invoke('itf:test', 'comp1', 'send', { data: 42 })
    assert.equal(result, 'result-value')
  })

  it('invoke returns null when provider does not exist', async () => {
    const result = await bus.invoke('itf:test', 'missing', 'send', {})
    assert.equal(result, null)
  })

  it('invoke returns null after provider is withheld', async () => {
    const provider = { handleInvoke: async () => 'ok' }
    bus.provide('itf:test', 'comp1', provider)
    bus.withhold('itf:test', 'comp1')
    const result = await bus.invoke('itf:test', 'comp1', 'send', {})
    assert.equal(result, null)
  })

  it('connect returns false when any required parameter is null', () => {
    const cb = { connectionReady: () => {} }
    assert.ok(!bus.connect(null, 'comp1', cb))
    assert.ok(!bus.connect('itf:test', null, cb))
    assert.ok(!bus.connect('itf:test', 'comp1', null))
  })

  it('multiple pending callbacks all receive connectionReady when provide is called', () => {
    let count = 0
    const provider = { handleInvoke: async () => {} }
    const cb = { connectionReady: () => count++ }
    bus.connect('itf:test', 'comp1', cb)
    bus.connect('itf:test', 'comp1', cb)
    bus.provide('itf:test', 'comp1', provider)
    assert.equal(count, 2)
  })
})
