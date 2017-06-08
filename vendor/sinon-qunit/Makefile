default: test lint build
build:
	./build
test: lib/sinon-qunit.js
	jstestdriver --tests all --reset
clean:
	rm -fr pkg
lint:
	juicer verify {lib,test}/*.js
	jsl --conf jsl.conf lib/*.js test/*.js
