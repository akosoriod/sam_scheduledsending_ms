const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDb =require('node-couchdb');
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const couch = new NodeCouchDb({
  auth:{
    user:'admin',
    password:'admin'
  }
});

const dbName = 'scheduledsending';
var db = new PouchDB('scheduledsending');
const viewUrl = '_design/all_sheduledsending/_view/all';

couch.listDatabases().then(function(dbs){
});


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.listen(3006, function(){
  console.log('Server Started On Port 3006');
});

app.get('/', function (req, res){
    couch.get(dbName, viewUrl).then(
      function(data, headers, status){
        res.render('index',{
          scheduledsending:data.data.rows
        });
      },
    function(err){
      res.send(err);
    });
});
app.get('/scheduledsending/all', function (req, res){
    couch.get(dbName, viewUrl).then(
      function(data, headers, status){
        res.send(data.data.rows);
      },
    function(err){
      res.send(err);
    });
});
app.post('/scheduledsending/add', function (req, res){
    const user_id = req.body.user_id;
    const mail_id = req.body.mail_id;
    const year = req.body.date.year;
    const month = req.body.date.month;
    const day = req.body.date.day;
    const hour = req.body.date.hour;
    const minutes = req.body.date.minutes;
    couch.uniqid().then(function(ids){
      const id = ids[0];
      couch.insert('scheduledsending',{
        _id:id,
        user_id:user_id,
        mail_id:mail_id,
        date:{
          year:year,
          month:month,
          day:day,
          hour:hour,
          minutes:minutes
        }
      }).then(
        function(data, headers, status){
          res.send('Created successfully');
          res.redirect('/')
        },
        function(err){
          res.send(err);
        });
    });
});
app.put('/scheduledsending/update', function (req, res){
  couch.get(dbName, viewUrl).then(
    function(data, headers, status){
    var data=data.data.rows;
    const id = 0;
    const rev = 0;
    const user_id = req.body.user_id;
    const mail_id = req.body.mail_id;
    const year = req.body.date.year;
    const month = req.body.date.month;
    const day = req.body.date.day;
    const hour = req.body.date.hour;
    const minutes = req.body.date.minutes;
    for (i=0;i<data.length;i++){
      if(user_id==data[i].value.user_id && mail_id==data[i].value.mail_id){
        //console.log(data[i].);
        couch.update('scheduledsending',{
            _id:data[i].id,
            _rev:data[i].value.rev,
            user_id:user_id,
            mail_id:mail_id,
            date:{
              year:year,
              month:month,
              day:day,
              hour:hour,
              minutes:minutes
            }
          }).then(
            function(data, headers, status){
              res.send('Edited successfully');
            },
            function(err){
              res.send(err);
            });
        }
      }
    },
    function(err){
      res.send(err);
    });
});

app.delete('/scheduledsending/delete',function(req,res){
  couch.get(dbName, viewUrl).then(
    function(data, headers, status){
    var dat=data.data.rows;
    const user_id = req.body.user_id;
    const mail_id = req.body.mail_id;
    for (i=0;i<dat.length;i++){
      if(user_id==dat[i].value.user_id && mail_id==dat[i].value.mail_id){
        couch.del(dbName,dat[i].id,dat[i].value.rev).then(
        function(data, headers, status){
          res.send('Deleted successfully');
        },
        function(err){
          res.send(err);
        });
      }
    }
  },
  function(err){
    res.send(err);
  });
});

/*

function intervalFunc() {
  couch.get(dbName, viewUrl).then(
        function(data, headers, status){
          var data=data.data.rows;
          var now = new Date
          for (i=0;i<data.length;i++){
             if (data[i].value.date.year==now.getFullYear()){
               if (data[i].value.date.month==now.getMonth()+1){
                 if (data[i].value.date.day==now.getDate()){
                   if (data[i].value.date.hour==now.getHours()){
                     if (data[i].value.date.minutes==now.getMinutes()){
                         couch.del(dbName, data[i].id,data[i].value.rev).then(
                           function(data, headers, status){
                           },
                           function(err){
                             res.send(err);
                           });

                         }
                        }
                      }
                    }
                  }
              }
          });
      }


setInterval(intervalFunc, 1500);
*/
