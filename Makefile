.PHONY: lint all

all: lint

lint:
	jsl -conf jsl.conf

oldlint:
	echo "app.js"
	-bundle exec jslint --indent="2" --browser="true" --devel --vars --predef='[\"\$$\",\"\$$fh\"]' --plusplus  client/default/js/app.js
	echo "main.js"
	-bundle exec jslint --indent="2" --devel --vars --predef='[\"\$$fh\"]' --plusplus  cloud/main.js
	echo "paypal.js"
	-bundle exec jslint --indent="2" --devel --vars --predef='[\"\$$fh\"]' --plusplus  cloud/paypal.js

