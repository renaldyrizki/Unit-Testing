'use strict';
const olx = require("../src/olx.js");
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

const category = "/elektronik-gadget/q-xiaomi/";
const selector = {
	container: {
		tag: '#gallerywide > li',
		not: '',
		attr: '',
	},
	link: {
		tag: 'a.detailsLink',
		not: '',
		attr: 'href',
		suffix: '',
	},
};

const category_2 = "/properti/tanah/q-tanah/";
const selector_2 = {
	container: {
		tag: '.offer table tr',
		not: '.promoted',
		attr: '',
	},
	link: {
		tag: 'a.detailsLink',
		not: '',
		attr: 'href',
		suffix: '',
	},
};
const category_err = "/properti/tanah/q-tanahsss/";
const selector_err = {
	container: {
		tag: '.wrongclass',
		not: '',
		attr: '',
	},
	link: {
		tag: '.wrongtag',
		not: '',
		attr: '',
		suffix: '',
	},
};
const olx_content = new olx(selector, category);
var result;
var result2;
var result3;
const key = ["address", "city","condition","content","datetime","id_iklan","images","luas_tanah","luas_tanah_string","ms_time","price","price_string","seller","sertifikasi",   "title",   "url"];


describe('TestCrawler', function() {

	describe('Category Electronic', function() {
		it('getLink', async () => {
		  	result = await olx_content.getLink(category, selector);
		  	expect(result.length).to.equal(16);
		  	expect(result).to.be.an('array');
	 	});

	 	it('getContent', async () => {
		  	result2 = await olx_content.getContent(result[0]);
		  	expect(result2).to.be.an('object').that.has.all.keys(key);
	 	});
	});

	describe('Category Tanah', function() {
		it('getLink', async () => {
		  	result = await olx_content.getLink(category_2, selector_2);
		  	expect(result.length).to.equal(16);
	 	});

	 	it('getContent', async () => {
		  	result2 = await olx_content.getContent(result[0]);
		  	expect(result2).to.be.an('object').that.has.all.keys(key);
	 	});
	});

	describe('Error', function() {
		it('getLink', async () => {
			 result = await olx_content.getLink(category_err, selector_err);
			 expect(result.length).to.equal(0);
	 	});
	});
});
