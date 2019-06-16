SDKore
===

## Install

```bash
yarn add sdkore
```

## Commands
```bash
# Build src
yarn build

# Test src
yarn test

# Generate doc
yarn doc

# Lint code (--fix to auto fix)
yarn lint

# Build examples
yarn build:examples
```

## Usage

See `examples` folder for common usage.

## Upgrade

Be sure to check any changes [in the Upgrade doc](UPGRADE.md)

## Contribution

Please see [the Contribution guide](CONTRIBUTING.md)

## Changelog

Please see [the Changelog file](CHANGELOG.md)


## Roadmap
### 1.0.0
- [x] Documentation
- [x] Tests
- [x] AbstractAccessor
- [x] AbstractCombinedAccessor
- [x] Custom header management (token customer, pagination)
- [x] Image upload (customer image)
- [x] Criteria management (`findByLabel` > `findByCriteria({label: 'whatever'})`)
- [x] Sort, search, filter management
- [x] Better PSR-16 like cache adapters
- [x] Better error handling
- [x] Auto generated code doc
- [x] Pagination

### 1.21.x - API Sync
- [x] Cache Request System
- [x] Cancellable requests
- [x] Better annotations
- [x] Any resource identifier support (id, uuid, etc..)

### 1.22.x
- [x] Simple CachePolicy
- [x] API token in Client constructor

### 2.0.0
- [x] Split business logic and go open source
- [x] Monorepo
- [x] SDK base + SDK Plugin

### Next
- [ ] Functional tests
- [ ] Business Layer Plugin
- [ ] Server fallback (+ business layer fallback) (+ websocket fallback)
- [ ] Change request mocker from nock to sinon
