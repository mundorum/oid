import { css, Oid } from '/lib/oidlib-dev.js'

Oid.customize('oid:button', {
  cid: 'big',
  style: css`
  .btn {
    width: 300px;
    height: 300px;
  }`
})