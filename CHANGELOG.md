# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [unreleased]

### Added

- support for `bestEffort` option of VRPC
- error message types: `VrpcError` and `NetworkError`

### Fixed

- using error objects consistently
- calling `onError` in case of vrpc related issues

### Changed

- upgraded dependencies
- upgraded examples to use React 18
- cleaned directory and dependency structure

## [3.1.0] - May 18 2022

- added capability for setting an "identity" for the underlying VRPC client

## [3.0.1] - Jan 27 2022

- adapted documentation to respect the separation of vrpc.io vs heisenware.cloud
- using `vrpc` instead of `public.vrpc` as default domain

## [3.0.0] - Jan 20 2022

### Added

- callback function for error conditions

### Fixed

- backend filtering (now respecting agent information as well)

## [3.0.0] - 11 Nov 2021

### Changed

- using hooks only
- removed regular expression support
- adapted to VRPC 3 changes (mainly renaming `VrpcRemote` to `VrpcClient`)

## [1.1.1] - 03 Feb 2021

### Fixed

- fixed potential timeout on when classes could belong to several agents (#33)
- fixed wrong nesting level on injected vrpc client prop (#31)
- added missing default to `useClient` hook (#28)

## [1.1.0] - 22 Dec 2020

### Added

- support for vrpc's new `callAll` feature
- examples (ported from vrpc) and corresponding cypress tests
- travis-ci integration

### Fixed

- problem regarding instance obtainment
- `backend.get()` function, which now always returns an instance proxy

### Changed

- updated dependencies
- updated package.json keywords

## [1.0.0] - 19 Jun 2020

### Added

- possibility to select individual backends per component
- hook based API
- possibility to refresh all components using a specific backend
- better support for individual instances managed by a backend

### Changed

- organization of inner state and its provisioning
- the value of the inject backend, now reflecting an object
- the way how backends are loaded (lazy loading, never blocking)
- error handling

### Fixed

- several issues regarding stability while refreshing-page or re-loading the
  backend

## [0.9.2]

### Fixed

- fixed broken componentWillUnmount

## [0.9.1]

### Changed

- changed default value of event to be null

### Added

- added streamlined ability to have multi backends with different options
- added ability to use vrpc object directly
- added support for backend events to passed to frontend

## [0.9.0]

### Added

- added streamlined ability to have multi backends with different options
- added ability to use vrpc object directly
- added support for backend events to passed to frontend

## [0.8.0]

### Added

- possibility to use an already existing backend (using `instance`)
- possibility to create a named backend (using `instance` and `args`)

## [0.7.0]

### Changed

- added username/password authentication
- moved `domain` configuration from `backends` to global setting

## [0.6.0]

### Added

- this CHANGELOG.md file
