#### HEAD ([diff](https://github.com/afeld/backbone-nested/compare/v1.1.2...master?w=1))

* Backbone 1.x support ([#96](https://github.com/afeld/backbone-nested/pull/96))
* add option to test from command line and run tests on Travis CI
* fix `remove()` not firing `'remove'` event when last element of array is removed ([#19](https://github.com/afeld/backbone-nested/issues/19))
* fix `clear()` and set nested attributes on `changedAttributes()` (thanks @isakb)
* `'change'` events will no longer fire if new value matches the old

#### 1.1.2 ([diff](https://github.com/afeld/backbone-nested/compare/v1.1.1...v1.1.2?w=1))

* `changedAttributes()` should include the nested attribute paths
* remove warnings when retrieving nested objects - more of a nuisance than a convenience

#### 1.1.1 ([diff](https://github.com/afeld/backbone-nested/compare/v1.1.0...v1.1.1?w=1))

* fixed `remove()` to not insert array back into itself
* upgraded test suite to Backbone 0.9.2

#### 1.1.0 ([diff](https://github.com/afeld/backbone-nested/compare/v1.0.3...v1.1.0?w=1))

* Backbone 0.9.1 compatibiity
* fire 'remove' event from remove()
* added add() method
* added [demo pages](https://github.com/afeld/backbone-nested/tree/master/demo)

#### 1.0.3 ([diff](https://github.com/afeld/backbone-nested/compare/v1.0.2...v1.0.3?w=1))

* fixed `toJSON()` ([p3drosola](https://github.com/afeld/backbone-nested/pull/9))

#### 1.0.2 ([diff](https://github.com/afeld/backbone-nested/compare/v1.0.1...v1.0.2?w=1))

* added option to silence `get()` warnings for non-leaf attributes

#### 1.0.1 ([diff](https://github.com/afeld/backbone-nested/compare/v1.0.0...v1.0.1?w=1))

* header and documentation fixes

#### 1.0.0

Initial release!
