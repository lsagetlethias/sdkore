# Contributing

Thank you for contributing to the Wynd SDK API.

## Code of Conduct
This project and everyone participating in it is governed by the [Wynd Code of Conduct]. By participating, you are
expected to uphold this code. Please report unacceptable behavior to [the project maintainer][mainEmail]

## Issues and Merge Requests
Before submitting any issue, please make sure to search that your problem is not currently listed in currently open
(and closed) ones.  
Don't forget to fill out the [issue default template](/.gitlab/issue_templates/Default.md) or the
[merge request default template](/.gitlab/merge_request_templates/Default.md)  
For merge requets, be SURE to follow this list if you don't want a panic attack from @gitlab-bot :robot: :  
  - MR must start with issue number (#xxx)
  - Issue in title and issue in description should be the same
  - An active milestone should be set
  - Coverage should be at 100%
  - Labels must be set properly

## Styleguides
### Coding Style :keyboard:
If you use and IDEA ide (Intellij, WebStorm, PhpStorm), you can import the [code style definition](code_style_intellij.xml)
to you project. This code style will be synced to the Prettier/TSLint set of rules.

The project is ruled by Prettier and TSLint. Don't forget to `yarn lint` and `yarn lint --fix` anytime you can or the
hook the fixer to you ide.

### Typescript Styleguide :lipstick:
- Always inline `export` keywords when you can

```typescript
export class ClassName {
    
}
// instead of
class ClassName {
    
}
export ClassName;
```
- Never use `export default`
- Always prefer `interface` over `type`
- Never forget to export whatever you want to expose in [/src/index.ts](/src/index.ts) file
- Prefer [Yoda style conditions](https://en.wikipedia.org/wiki/Yoda_conditions)(`'string' === myVar` instead of
`myVar === 'string'`)
- Avoid typing when implicit typing is available

```typescript
// bad
const value: string = 'test';
//
// good
const value = 'test';
//
// ---
//
class MyClass {
    // bad
    public a(): void {
        // no return or "return;"
    }
    
    // good
    public b() {
        // no return or "return;"
    }
}
```

## GIT
### Git Commit Messages :memo:
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Follow the [.gitmessage file](.gitmessage)
- Limit the first line to 50 characters or less
- **Only** when changing documentation, include `[skip ci]` at the end of your subject. Any abuse will be sanctioned.
- Start any commit message with an applicable emoji (shortcode or character) :
    - :sparkles: `:sparkles:` when introducing new features
    - :art: `:art:` when improving the format/structure of the code
    - :zap: `:zap:` when improving performance
    - :memo: `:memo:` when writing docs
    - :bug: `:bug:` when fixing a bug
    - :fire: `:fire:` when removing code or files
    - :truck: `:truck:` when moving or renaming files
    - :green_heart: `:green_heart:` when fixing the CI build
    - :white_check_mark: `:white_check_mark:` when adding tests
    - :lock: `:lock:` when dealing with security
    - :arrow_up: `:arrow_up:` when upgrading dependencies
    - :arrow_down: `:arrow_down:` when downgrading dependencies
    - :rotating_light: `:rotating_light:` when removing linter warnings
    - :ambulance: `:ambulance:` when adding a critical hotfix
    - :recycle: `:recycle:` when refactoring code
    - :pencil2: `:pencil2:` when fixing typo
    - :boom: `:boom:` when introducing breaking changes
    - :ok_hand: `:ok_hand:` when for code reviews (combined with another emoji)

### Git branches :twisted_rightwards_arrows:
- Extended Gitflow naming convention
- **Only** start an hotfix branch from `master` (or tagged version)
- Issue number reference (without sharp)
- No emoji (nor shortcode)
- kebab-case

> e.g.
> - `feature/XXX-<issue-title>` for features and improvements merge request
> - `hotfix/XXX-<issue-title>` for bugs or critical hotfixes
> - `config/XXX-<issue-title>` for pure config related modification
> - `archi/XXX-<issue-title>` for anything else architecture or project related modification (ci, doc, ...)

### Git ignore file :see_no_evil:
`.gitignore` file should not contains any host specific rules. Be sure to complete your global ignore file located
in `~/.gitignore_global`.  
Here a sample with what should be **in global** and **not in the in-project** file:
```ignore
*~
.DS_Store
.idea
yarn-error.log
/.idea/
/.vscode/
```


## Adding feature :sparkles:
Any added feature must have the appropriate unitary test associated to it. Whether it is a model, a cache adapter, or an
accessor.

### TL;DR - FEATURE TODOLIST
- [ ] I get from the [Gitlab board](https://gitlab.wynd.eu/sdk/api-js/boards) any issue in `To Do` column
(or create mine) and drag it onto `Doing` column. I also assign myself to the ticket
- [ ] I start my branch from develop
- [ ] During my commits, I make sure that I format properly my message (one emoji by commit) (e.g. :ok_hand: is only used after merge request review)
- [ ] I use `yarn lint --fix` to auto fix some part of my code
- [ ] I use `yarn lint --fix index.d.ts` to auto fix some part of the root def file
- [ ] When creating my MR, I must use the MR template and I make sure that I'm referencing the associated issue with `#00` instead of full link
- [ ] MR title should start with issue number (`#00`) (this will be used when generating CHANGELOG)
- [ ] I make sure that the coverage is still at 100%
- [ ] When I think that my MR is done, I squash my commits and remove the "WIP" status, and drag my ticket "In Review"
- [ ] If the @gitlab\-bot made a comment on my MR, I resolved it and remove the ~Unmergeable label

---

- To add a custom method you see how it's done in `InvoiceAccessor`
- To disable a crud overrided method, you can see how it's done in `PaymentAccessor`

---
---

### Model
Models are not mandatory, but highly recommended for easy `Ctrl+Space` auto-complete suggestions from API returned data.

A model must be synced with it's fixture and/or it's corresponding API model.

---
> Models should implements [`IModel type-interface`](/src/DTO/IModel.ts)

A model have to be an interface with members ; `id` (or chosed identifier) is already added in `IModel`:
```typescript
interface MyModel implements IModel {
    label: string;
    value: boolean;
}

// or
interface MyUuidModel implements IModel<'uuid', string> {
    label: string;
    value: boolean;
}
```

If your model will have a picture uploaded throught the classical way in Wynd API, you can implement `IPictureAwareModel` instead.  

---
### Accessor
Any api provided data (bind with a model) have to be accessible via an appropriate accessor. This class will use the
latest registered `Client` in the sotre to call the api.  
An accessor is basically syntactic sugar and token handler for api routes and ways to use them.
> Accessors should extends [`AbstractAccessor class`](/src/DAO/AbstractAccessor.ts)  
The abstract class will provide access to the client and normalize basic CRUD methods.

#### Adding a new Accessor
Admit that we want to access `customer` endpoint with a `CustomerModel`.
> Add the namespace/route endpoint to [the constant file](src/utils/Const.ts)

```typescript
const ROUTE = {
    // <namespace>: </api_route>
    // namespace is the desired resource name, singular
    customer: '/customers',
};
```
---
> Extends `AbstractAccessor`, precise the associated model, and override all basic CRUD methods if you need to

```typescript
class CustomerAccessor extends AbstractAccessor<Customer> {
    public constructor() {
        super(ROUTE.customer);
    }
}

// or (by assuming that `Customer` implements currectly `IModel` with uuid)
class CustomerUuidAccessor extends AbstractAccessor<Customer, 'uuid'> {
    constructor() {
        super(ROUTE.customer, 'uuid');
    }
}
```

After CRUDs you can add any custom/specific methods (with filter or anything).

#### Customizing you Accessor
Sometimes, an accessor need some peculiar business logic. To help you, the SDK expose annotation that can be used to
flag those edge cases.  
For example (in an `customer` accessor context), you will in some cases to upload an image before really updating the 
model. And in every cases, you will need to provide a customer token to the request.
> Add as annotation as you need to skip non-dry code

```typescript
class CustomerAccessor extends AbstractAccessor<Customer> {
    public constructor() {
        super(ROUTE.customer);
    }

    @HeadersOnce({'wynd-app': 'front'})
    @NoCache
    @ProvideCustomerToken
    @PrependUpload('customer')
    public async update(model: Customer): Promise<Customer> {
        return super.update(model);
    }
}
```

#### CombinedAccessor
Combined accessors are extended accessors based on two models instead of one. They are useful when you need to access a
resource based on another and your endpoint reflects it.  
For example, an `OrderByCustomerAccessor`, as it can be easily understandable, is designed to get order depending on a
specific customer.  
In this case, you don't have to declare the complex route endpoint as it will be built by the SDK. If a target route 
does not exist yet, and you're sure that their will never be a single accessor to it, you can exceptionally omit it and
use a plain string representation instead.  

A source model is the one from which a target model is fetched.

---
> Extends `AbstractCombinedAccessor`, precise the source model and the target model, and override all basic CRUD methods
> if you need to

```typescript
class OrderByCustomerAccessor extends AbstractCombinedAccessor<Customer, Order> { // <source, target>
    public constructor() {
        // (source route, target route)
        super(ROUTE.customer, ROUTE.order);
    }
}
```

---
#### Test the Accessor (and its model)
First you have to add the fixture you want to use for the accessor. This fixture have to have the namespace defined
before.
> The defined namespace should be used for fixture mapping purpose

---
> add a `test/__fixtures__/customer.json`

```json
{
  "customer_1": {
    "id": 1,
    "originalEntity": "@entity_1",
    "active": true,
    "password": "test",
    "entity": "@entity_1",
    "email": "john.doe@wynd.eu",
    "login": "johndoe",
    "firstname": "John",
    "lastname": "Doe",
    "company": "@company_1",
    "externalId": 1,
    "registerNumber": 123456,
    "paymentMode": "@paymentMode_cashpayment",
    "cohorts": [
      "@cohort_1"
    ],
    "attributes": {
      "opt-in": 1
    },
    "customerDivision": "@customerDivision_1",
    "maxPaymentOverdraft": "123456789"
  }
}
```

This is a full customer fixture. You have to add *all* the field needed by the api only if you need them for custom
methods.  
Only the `id` field is mandatory. Then use the following format:

```json
{
  "<namespace>_<id>": {
    "id": "<id>",
    "[prop]": "[value]"
  }
}
```

As a value, you can:
- Add a `@` before a string to refer to an other fixture by its namespace-id combo
- Add a `@@` if you want to escape a string that starts with `@` (so `"@@hello"` will be escaped to `"@hello""`)
- Use any json valid type

---
> in [`test/fixtures.d.ts`](/test/fixtures.d.ts)

```typescript
declare type FixtureNamespace =
    // ...
    | 'customer'
    | '<namespace>'
```
Helper functions has been made to very quickly scale test (and coverage) with what you just developed.
>in `test/customer.test.ts`

```typescript
// optionally
describe('CustomerAccessor custom method', () => {
    it('should use my custom method', () => {
        // custom methods test
    });
});

// then
// args: <namespace>, <accessor>
TestMaker.testBasicCrud('customer', CustomerAccessor).make();
```

For more information please check the [Tests README](/test/README.md)

Then test all you contribution with `yarn test --verbose --coverage`

#### Add new test generator methods to the TestMaker

>in `test/__utils__/testMaker.ts`

If you need to, you can add Wrappers or Doers to the test maker (see [Tests README](/test/README.md)).  
Above all, any method must returns a `jest.describe` bound function and:
- Wrappers have to take a callback as parameter
- Doers can have anything as parameters

[Wynd Code of Conduct]: /CODE_OF_CONDUCT.md
[mainEmail]: mailto:lsagetlethias@wynd.eu
