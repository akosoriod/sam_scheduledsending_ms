const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDb =require('node-couchdb');

const couch = new NodeCouchDb({
  auth:{
    user:'admin',
    password:'admin'
  }
});

const dbName = 'scheduledsending';
const viewUrl = '_design/all_sheduledsending/_view/all';

couch.listDatabases().then(function(dbs){
});


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

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

app.post('/scheduledsending/add', function (req, res){
    const id_mail = req.body.id_mail;
    const year = req.body.date.year;
    const month = req.body.date.month;
    const day = req.body.date.day;
    const hour = req.body.date.hour;
    const minutes = req.body.date.minutes;

    couch.uniqid().then(function(ids){
      const id = ids[0];
      couch.insert('scheduledsending',{
        _id:id,
        id_mail:id_mail,
        date:{
          year:year,
          month:month,
          day:day,
          hour:hour,
          minutes:minutes
        }
      }).then(
        function(data, headers, status){
          res.redirect('/')
        },
        function(err){
          res.send(err);
        });
    });
});
app.put('/scheduledsending/update/id', function (req, res){
    const id=req.params.id;
    const rev = req.body.rev;
    const id_mail = req.body.id_mail;
    const year = req.body.date_year;
    const month = req.body.date_month;
    const day = req.body.date_day;
    const hour = req.body.date_hour;
    const minutes = req.body.date_minutes;
    couch.update('scheduledsending',{
        _id:id,
        _rev:rev,
        id_mail:id_mail,
        date:{
          year:year,
          month:month,
          day:day,
          hour:hour,
          minutes:minutes
        }
      }).then(
        function(data, headers, status){
          res.redirect('/')
        },
        function(err){
          res.send(err);
        });

});
app.post('scheduledsending/delete/id',function(req,res){
  const id=req.params.id;
  const rev = req.body.rev;

  couch.del(dbName, id,rev).then(
    function(data, headers, status){
      res.redirect('/');
    },
    function(err){
      res.send(err);
    });
  });

app.listen(3006, function(){
  console.log('Server Started On Port 3006');
});
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
