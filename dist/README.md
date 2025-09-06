# -o-id

Web components based on the Digital Content Component (DCC) model for the Mundorum space.

# Environment Install

In this project root directory:
~~~bash
npm install
~~~

# Development

To bundle the JavaScript components and infrastructure, we adopt  Vite. The following statements build the development and production packages:

## Development Package

~~~bash
npm run build:dev
~~~

## Production Package

~~~bash
npm run build
~~~

## Playground and Test Environment

The environment can be prepared for local execution for learning, tests, and development. We suggest the following steps to prepare the environment:

To provide flexibility, the default `package.json` configuration does not include the -o-id library, and there are two installation options. They are exclusive, and you cannot apply both:

### -o-id Adopter

If you are only using the -o-id library without modifying it, you can install it:
~~~bash
npm install @mundorum/oid
~~~

### -o-id Developer

Suppose you are modifying the library and you want your modifications to reflect in the playground or test environment automatically. In that case, you can emulate the -o-id library installation as a node module straight from your `dist` directory.

There are two steps to link local Mundorum libraries in the development mode.

Inside `/dist` directory:
~~~bash
npm link
~~~

Inside `/playground/npm/node_modules/` directory:
~~~bash
npm link @mundorum/oid
~~~

This procedure mimics the -o-id library installed in the npm straight from `dist`.

## Development Server

If you wish to run tests in code developed under the -o-id framework:

### Local Library Perspective

If you want to load NPM libraries locally, run the Vite server:
~~~bash
npm run dev
~~~

### CDN Library Perspective

If you want to load libraries from the jsDelivr CDN, as it will be in the deployed version, you can run a local web server under VSCode, the plugin [Microsoft Live Preview](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server).

