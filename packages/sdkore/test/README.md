# Test

## Introduction
Tests are pretty straightforward to set up. For each accessors service and theirs associated basic crud methods, you can use a maker to simplify crud test construction.

The `TestMaker` provide two type of function to use to build tests: Wrapper functions and "Doer" functions.

Wrapper functions can be chained with wrapper or doer, and add `beforeAll`-like methods to the test suite.  
Doer functions are more like finisher, they build the test itself using previously chained methods. Only `make()` function can be used after a doer.

---

## Wrappers
`prepareCustomerToken()`  
> Adds customer object and customer token to the client cache before each test cases

`setUploadable()`
> Ensure that upload will be tested when it's needed

`setNonCrud()`
> Ensure that all routes will be tested as non working

`setReadOnly()`
> Ensure that create and update routes will be tested as non working

`setUncreatable()`
> Ensure that create route will be tested as non working

`setUnreadable()`
> Ensure that read route will be tested as non working

`setUnreadAllable()`
> Ensure that readAll route will be tested as non working

`setUnupdatable()`
> Ensure that update route will be tested as non working

`setUndeletable()`
> Ensure that delete route will be tested as non working

`betterError()`
> Add a logger propagator to handle a better error output during test development process. See (Better logs)[#better-logs]


## Doers
`testBasicCrud<TAccessor extends AbstractAccessor<any>>(namespace: FixtureNamespace, accessorClass: { new (): TAccessor })`  
> Generates tests for a accessor targeted basic crud

`testCombinedCrud<TCombinedAccessor extends AbstractCombinedAccessor<any, any>>(namespace: FixtureNamespace, namespacePlus: FixtureNamespace, accessorClass: { new (): TCombinedAccessor })`
> Generates tests for a combined accessor targeted basic crud

## Better logs
If you need better logs during `Client` requests, you can activate an global option for an loudy output of error logs. This will call an internal system of the SDK called `propagator`.
To use it, you can either:
1. Use a [Wrapper](#wrappers) to make it works automaticaly with `TestMaker` pure tests.
2. Activate the option `global.__pleaseHelp = true` at the beginning of you custom test suite with a `beforeAll` hook (don't forget to make it false on `afterAll`)
3. Activate the same option on `beforeEach` hook (don't forget to make it false on `afterEach`)
4. Activate the same option manually at the beginning of a specific test

:warning: **Don't forget to remove it before any commit/push!!** :warning:
