const { test, expect } = require('@playwright/test')
const { Bus } = require('../src/infra/bus')

test.describe('Bus publish/subscribe', () => {

  test('basic single message', () => {
    const refTopic = 'test/one'
    const refMessage = 'body of message'
    Bus.i.subscribe(refTopic, (topic, message) => {
      expect(topic).toEqual(refTopic)
      expect(message).toEqual(refMessage)
    })
    Bus.i.publish({'test/one': refMessage})
  })

  test('unsubscribe bus', () => {
    const refTopic = 'test/one'
    const refMessage = 'body of message'
    const refCallback = (topic, message) => {
      test ('this function should not be called', () => {
        expect(true).toEqual(false)
      })
    }
    Bus.i.subscribe({'test/one': refCallback})
    Bus.i.unsubscribe({'test/one': refCallback})
    Bus.i.publish(refTopic, refMessage)
  })

  // test('wildcard test', () => {
  //   const refTopic = 'test/one'
  //   const refSubscribeYes = '+/one'
  //   const refSubscribeNo = '+/dinosaur'
  //   const refMessage = 'body of message'
  //   Bus.i.subscribe(refSubscribeYes, (topic, message) => {
  //     expect(topic).toEqual(refTopic)
  //   })
  //   Bus.i.subscribe(refSubscribeNo, (topic, message) => {
  //     test.fixme(true, '[' + refSubscribeNo + '] should not be called')
  //   })
  //   Bus.i.publish(refTopic, refMessage)
  // })

  // test('wildcard subscriptions', () => {
  //   const allMessages =
  //     ['news/disease', 'news/drug',
  //      'news/dinosaur', 'report/dinosaur',
  //      'news/disease/viral']
  //   const subs = [
  //     {subscription: 'news/#',
  //      messages: ['news/disease', 'news/drug', 'news/dinosaur',
  //                 'news/disease/viral']},
  //     {subscription: 'news/disease',
  //       messages: ['news/disease']},
  //     {subscription: '+/dinosaur',
  //       messages: ['news/dinosaur', 'report/dinosaur']}
  //   ]
  //   const refMessage = 'body of message'
  //   for (const s of subs) {
  //     Bus.i.subscribe(s.subscription, (topic, message) => {
  //       console.log('===== subscription: ' + s.subscription)
  //       console.log('===== expected: ' + s.messages)
  //       console.log('--- actual: ' + topic)
  //       expect(s.messages).toContainEqual(topic)
  //     })
  //   }
  //   for (const m of allMessages)
  //     Bus.i.publish(m, refMessage)
  // })

})
