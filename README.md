# -o-id

Web components based on the Digital Content Component (DCC) model for the Mundorum space.

# Development

To bundle the JavaScript components and infrastructure, we adopt  WebPack. The following statements build the development and production packages:

## Development Package

~~~
npx webpack --config webpack.config.dev.js --mode=development
~~~

## Production Package

~~~
npx webpack --config webpack.config.js --mode=production
~~~

## Development Server

If you wish to run tests in code developed under the -o-id framework, we advise installing the node.js [Web Dev Server](https://modern-web.dev/docs/dev-server/overview/). The `<script type="module">`, usual in the development mode, do not accept module inclusion from `file:` pages; they must be `http(s):`.

* installing http-server: `npm install @web/dev-server --save-dev`
* running http-server: `npx web-dev-server --node-resolve`
