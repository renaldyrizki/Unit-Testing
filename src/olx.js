const Scraper = require('./scraper.js');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

var scraper = new Scraper({
  baseUrl : 'https://www.olx.co.id'
});

class crawlContent {
  constructor(selectors, category){
    this.selectors = selectors;
    this.query = category;
    this.url = 'mongodb://localhost:27017';
  }

run(){
  this.getPage();
  var _this = this;
  setInterval(function () { _this.getPage();}, 20000);
}

async getAllPage(){
  for (var i = 1; i <= 500; i++) {
    console.log("Get Page: " + i);
    try{
      var LinkList = await this.getLink(this.query+'?page='+i);
      for (var j = 0; j < LinkList.length; j++) {
           LinkList[j] = await getContent(LinkList[j]);
      }
      // this.savetomongo(LinkList);
    }catch(err){
      console.log(err);
    }
  }
  console.log("Get All Page Done");
}

async getPage(){
  console.log("Get Page");
  try{
    var LinkList = await this.getLink(this.query, this.selectors);
    for (var j = 0; j < LinkList.length; j++) {
      LinkList[j] = await this.getContent(LinkList[j]);
    }
    var result = await this.savetomongo(LinkList);
    // console.log(result + "aaa");
  }catch(err){
    console.log(err);
  }
}

 getLink(query, linkselector) {
    return new Promise(function(resolve, reject){
      scraper.scrape(query, function(err, $) {
        if (err) {
          reject(err);
        } else {
          var LinkList = $(linkselector.container.tag).not(linkselector.container.not).map(function() {
            var link = $(this).find(linkselector.link.tag).attr(linkselector.link.attr);
            return link;
          }).get();
          resolve(LinkList);
        }
      });
    });
 }

 getContent(Linkdata){
    return new Promise(function(resolve, reject){
      scraper.scrape(Linkdata.substr(21), function(err, $) {
        if (err) {
          reject(err);
        }else{
          var ms_time = $('noscript > img').attr('src');
          ms_time = ms_time.substr(ms_time.lastIndexOf("=")+1) + "000";
          var datetime = new Date(+ms_time);
        	var title = $('.offerheadinner > h1.brkword').text().trim();
        	var content = $('#textContent > p > span').map(function (){ return $(this).text().trim() ; }).get().filter(text => text).join(' ').replace(/\s\s+/g, ' ');
        	content = content.replace(/\n+/g, ' ');
        	var spesifikasi = [];
        	var address = $('.address div').text().trim();
        	var city = $('.link.gray.cpointer a').text();
        	var id = $('small .nowrap .rel.inlblk').text().trim();
        	var price_string = $('.pricelabel strong').text().trim();
        	var price = Number(price_string.replace(/Rp|[.]|\s/g,""));
        	var luas_tanah_string = $('.spesifikasi li').first().clone().children().remove().end().text().replace(/\t|\n|\s:+/g, '').trim();
        	if (luas_tanah_string) {
            luas_tanah_string+='2'; 
          }
        	var luas_tanah = Number(luas_tanah_string.replace(/m2|[.]|\s/g,""));
        	var sertifikasi = $('.spesifikasi li > a').text().trim();
        	var seller = $('.userdetails > a > span').text();
          var condition = $('.icon-bekas.small').text();
        	let images = [];
        	$('.overh#bigGallery > li.fleft > a').map(function (){
        	   images.push($(this).attr('href'));
        	});
        	var metadata = {
          	id_iklan: id,
          	title: title,
          	url: Linkdata,
          	datetime: datetime,
          	ms_time: ms_time,
          	content: content,
          	images: images,
          	price: price,
          	price_string: price_string,
          	luas_tanah: luas_tanah,
          	luas_tanah_string: luas_tanah_string,
            condition: condition,
          	sertifikasi: sertifikasi,
          	seller: seller,
          	address: address,
          	city: city,
        	};
  		    resolve(metadata);
        }
      });
    });
 }

 savetomongo(myobj){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
        if (err) { 
            reject(err);
        }else{
            var db = client.db("kazee_ojk");
            var collection = db.collection('olx');
            for (var i = 0; i < myobj.length; ++i) {
              var id = myobj[i].id_iklan;
              collection.bulkWrite( [
                 { updateMany :
                    {
                       "filter" : <document>,
                       "update" : <document>,
                       "upsert" : true,
                       "collation": <document>,
                       "arrayFilters": [ <filterdocument1>, ... ]
                    }
                 }
              ] );
              collection.updateOne(
                  { id_iklan: id },
                  { $set: myobj[i]},
                  { upsert: true }, 
                  function(err, res) {
                    if (err) {
                      console.log(err);
                    }else{
                      console.log(res.result);
                    }
                    client.close();
              });
            }
        }
    });
 }
}//end of class
module.exports = crawlContent;