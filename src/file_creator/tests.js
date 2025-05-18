const { Creator } = require('./creator');
const creator = new Creator();

Creator.createContest("/Users/quochuytran/Downloads", "abc398", "b-d.cpp", {on_file_created:{}});
//creator.checkConfig();