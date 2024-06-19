HTML_FILE_NAME := index.html
CSS_FILE_NAME := nol_tsukumo.css
JS_FILE_NAME := nol_tsukumo.js

SRC_DIR := .
SRC_HTML := $(SRC_DIR)/$(HTML_FILE_NAME)
SRC_CSS := $(SRC_DIR)/$(CSS_FILE_NAME)
SRC_JS := $(SRC_DIR)/$(JS_FILE_NAME)

OUT_ROOT_DIR := out
SITE_OUT_DIR := $(OUT_ROOT_DIR)/site
SITE_OUT_HTML := $(SITE_OUT_DIR)/$(HTML_FILE_NAME)
SITE_OUT_CSS := $(SITE_OUT_DIR)/$(CSS_FILE_NAME)
SITE_OUT_JS := $(SITE_OUT_DIR)/$(JS_FILE_NAME)
SITE_OUT_JSDOC_DIR := $(SITE_OUT_DIR)/jsdoc

VERSION := $(shell git log -n 1 --pretty=format:"%h")
DATETIME := $(shell git log -n 1 --pretty=format:"%ad")

all: site

clean: clean-out

clean-out: clean-site
	rm -rf $(OUT_ROOT_DIR)

clean-site:
	rm -rf $(SITE_OUT_DIR)

site:  $(SITE_OUT_HTML) $(SITE_OUT_JS) $(SITE_OUT_CSS) site-jsdoc

$(SITE_OUT_DIR):
	mkdir -p $@

$(SITE_OUT_HTML): $(SITE_OUT_DIR) $(SRC_HTML)
	sed -e 's/NolTsukumoVersion/$(VERSION)/g' -e 's/NolTsukumoDateTime/$(DATETIME)/g' $(SRC_HTML) > $(SITE_OUT_HTML)

$(SITE_OUT_CSS): $(SITE_OUT_DIR) $(SRC_CSS)
	cp $(SRC_CSS) $(SITE_OUT_CSS)

$(SITE_OUT_JS): $(SITE_OUT_DIR) $(SRC_JS)
	cp $(SRC_JS) $(SITE_OUT_JS)

site-jsdoc: setup-npm
	mkdir -p $(SITE_OUT_JSDOC_DIR)
	npm run doc

setup-npm:
	npm install

lint: setup-npm
	npm run lint

.PHONY: all clean clean-out clean-site site site-jsdoc setup-npm lint
