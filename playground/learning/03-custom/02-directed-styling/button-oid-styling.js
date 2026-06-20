import { css, Oid } from '@mundorum/oid/oid.js'

Oid.customize('oid:button', {
  cid: 'big',
  style: css`
  .btn {
    width: 300px;
    height: 300px;
  }`
})