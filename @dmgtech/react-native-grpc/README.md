# react-native-grpc

a bridge from react-native to native grpc libraries

## Installation

```sh
npm install react-native-grpc
```

## Usage

```js
import GrpcReactNative from '@dmgtech/tsgrpc-driver-react-native';
import { use, unaryCall } from '@dmgtech/tsgrpc';

use(GrpcReactNative.configure({host: '127.0.0.1', port: 50051, secure: false}));

const result = await unaryCall(MyService.MyMethod, {my: "args"});

// ...

```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
