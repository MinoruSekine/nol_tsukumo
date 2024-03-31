HTML_FILE_NAME := index.html
JS_FILE_NAME := nol_tsukumo.js

SRC_DIR := .
SRC_HTML := $(SRC_DIR)/$(HTML_FILE_NAME)
SRC_JS := $(SRC_DIR)/$(JS_FILE_NAME)

OUT_ROOT_DIR := out
SITE_OUT_DIR := $(OUT_ROOT_DIR)/site
SITE_OUT_HTML := $(SITE_OUT_DIR)/$(HTML_FILE_NAME)
SITE_OUT_JS := $(SITE_OUT_DIR)/$(JS_FILE_NAME)
SITE_OUT_JSDOC_DIR := $(SITE_OUT_DIR)/jsdoc

VERSION := $(shell git log -n 1 --pretty=format:"%H")

all: site

clean: clean-out

clean-out: clean-site
	rm -rf $(OUT_ROOT_DIR)

clean-site:
	rm -rf $(SITE_OUT_DIR)

site:  $(SITE_OUT_HTML) $(SITE_OUT_JS) site-jsdoc

$(SITE_OUT_HTML):
	mkdir -p $(SITE_OUT_DIR)
	sed 's/NolTsukumoVersion/$(VERSION)/g' $(SRC_HTML) > $(SITE_OUT_HTML)

$(SITE_OUT_JS):
	mkdir -p $(SITE_OUT_DIR)
	cp $(SRC_JS) $(SITE_OUT_JS)

site-jsdoc: setup-npm
	mkdir -p $(SITE_OUT_JSDOC_DIR)
	npm run doc

setup-npm:
	npm install

lint:
	npm run lint

.PHONY: all clean clean-out clean-site site site-jsdoc setup-npm lint
