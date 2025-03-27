const fs = require('fs');
const { Crawler } = require('../parser/crawler');
const { json } = require('stream/consumers');
const { wrapper, ProblemData } = require('../types');
const crawler = new Crawler();
class Creator {
  constructor() {
    this.name = "creator";
  }
	
  createContest(default_path, contest_id, number_of_problems, extension_file) {
		for(let i = 65; i - 65 < number_of_problems; i++){
			//console.log("Fetching problem " + String.fromCharCode(i) + " from contest " + contest_id);
			console.log(`${default_path}\\${contest_id}\\${String.fromCharCode(i)}.${extension_file}`);
			//fs.writeFileSync(`${default_path}\\ ${contest_id}\\ ${String.fromCharCode(i)}.${extension_file}`);
		}
		console.log("Contest created successfully");
	}
		 

	
	
}
module.exports = { Creator };