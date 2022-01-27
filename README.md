# VRPC - Variadic Remote Procedure Calls

[![Build Status](https://travis-ci.com/heisenware/vrpc-react.svg?branch=master)](https://travis-ci.com/heisenware/vrpc-react)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/heisenware/vrpc-react/master/LICENSE)
[![Semver](https://img.shields.io/badge/semver-2.0.0-blue)](https://semver.org/spec/v2.0.0.html)
[![GitHub Releases](https://img.shields.io/github/tag/heisenware/vrpc-react.svg)](https://github.com/heisenware/vrpc-react/tag)
[![GitHub Issues](https://img.shields.io/github/issues/heisenware/vrpc-react.svg)](http://github.com/heisenware/vrpc-react/issues)
![ci](https://github.com/heisenware/vrpc-react/actions/workflows/ci.yml/badge.svg)

## Visit our website: [vrpc.io](https://vrpc.io)

## What is VRPC?

VRPC - Variadic Remote Procedure Calls - is an enhancement of the old RPC
(remote procedure calls) idea. Like RPC, it allows to directly call functions
written in any programming language by functions written in any other (or the
same) programming language. Unlike RPC, VRPC furthermore supports:

- non-intrusive adaption of existing code, making it callable remotely
- remote function calls on many distributed receivers at the same time (one
  client - multiple agents)
- service discovery
- outbound-connection-only network architecture (using MQTT technology)
- isolated (multi-tenant) and shared access modes to remote resources
- asynchronous language constructs (callbacks, promises, event-loops)
- OOP (classes, objects, member functions) and functional (lambda) patterns
- exception forwarding

VRPC is available for an entire spectrum of programming technologies including
embedded, data-science, and web technologies.

As a robust and highly performing communication system, it can build the
foundation of complex digitization projects in the area of (I)IoT or
Cloud-Computing.

## This is VRPC for React

The React VRPC client is a complete solution for backend-frontend communication.
Unlike other libraries it allows to communicate with an arbitrary number
of potentially distributed backends at the same time.

The React VRPC client integrates seamlessly in a non-opinionated way into modern
React architectures. Built on top of the
[VRPC](https://github.com/heisenware/vrpc-js) library it allows to call backend
code directly, obsoleting the need to define any wrappers, schemas, resolvers or
adapters.

### Getting started

Maybe the easiest way to get started is by following these two examples:

- [Simple React Todos App](examples/vrpc-react-todos-1/README.md)
- [Advanced React Todos App](examples/vrpc-react-todos-2/README.md)

### Documentation

All other details are available [here](docs/api.md)
