var express = require('express');
var router = express.Router();
var fs = require('fs');
var async = require('async');
var co = require('co');
var thunkify = require('thunkify');

//var markdown = require("markdown").markdown;
//var lendHistoryModel = markdown.toHTML("");

var mysql = require('mysql');
var client = mysql.createConnection({
    'host': '127.0.0.1',
    'port': '3306',
    'user': 'root',
    'password': 'liuyan123'

});
var database = 'library';




var queryHighestRatingBook = "select * from book_lend_history where book_rating not regexp '收录|评价' order by book_rating desc limit 1";
var queryLowestRatingBook = "select * from book_lend_history where book_rating not regexp '收录|评价' order by book_rating limit 1";
var queryContainDoubanRatingBookCount = "select count(*) as count from book_lend_history where book_rating not regexp '收录|评价'";
var queryBookLendHistory = "select * from book_lend_history";

var queryRatingTopTwenty = 'select book_name,book_author,book_press,book_rating from book order by book_rating desc limit 20';
var queryRatingGT8 = "select distinct(book_name),book_rating from book_lend_history where book_rating not regexp '收录 | 评价 ' and book_rating > 8.0 ";


var querySeninor1 = "select count( * ) as count from book_lend_history where(book_time_borrow between '2012-09-01' and '2013-09-01')";
var querySeninor2 = "select count( * ) as count from book_lend_history where(book_time_borrow between '2013-09-01' and '2014-09-01')";
var querySeninor3 = "select count( * )  as count from book_lend_history where(book_time_borrow between '2014-09-01' and '2015-09-01')";
var querySeninor4 = "select count( * )  as count from book_lend_history where(book_time_borrow between '2015-09-01' and '2016-09-01')";
var queryPeriod = 'select * , datediff(book_time_return, book_time_borrow) as period from book_lend_history order by datediff(book_time_return, book_time_borrow) desc';


function getSumMoney(results) {
    var sumMoney = 0;
    var locations = [0, 0, 0, 0, 0];
    results.forEach(function (result) {
        var reg = /\d+(\.\d+)?/;
        var iScontainNumber = reg.test(result.book_price);

        if (iScontainNumber) {
            sumMoney += parseFloat(result.book_price.match(/(\d+\.)?\d+/g));
        }

        //        if ('201医学库'.test(result.book_location)) {
        //
        //            locations[0]++;
        //        } else if ('206综合库'.test(result.book_location)) {
        //
        //            locations[1]++;
        //        } else if ('207文艺、外文书库'.test(result.book_location)) {
        //
        //            locations[2]++;
        //        } else if ('图书密集库'.test(result.book_location)) {
        //
        //            locations[3]++;
        //        } else {
        //
        //            locations[4]++;
        //        }
    });
    return sumMoney.toFixed(2);

}
router.get('/', function (req, res, next) {


    client.query('use library');
    async.parallel([
            function (callback) {

                client.query(queryBookLendHistory, function (err, result0) {
                    if (err) callback(err);
                    callback(null, result0);

                });

            },
            function (callback) {
                client.query(queryLowestRatingBook, function (err, result1) {
                    if (err) callback(err);
                    callback(null, result1);

                });
            },

            function (callback) {

                client.query(queryContainDoubanRatingBookCount, function (err, result2) {
                    if (err) callback(err);
                    callback(null, result2);

                });

            },
        function (callback) {


                client.query(queryHighestRatingBook, function (err, result3) {
                    if (err) callback(err);
                    callback(null, result3);

                });

                        },
            function (callback) {


                client.query(queryRatingGT8, function (err, result4) {
                    if (err) callback(err);
                    callback(null, result4);

                });

                        },
            function (callback) {


                client.query(querySeninor1, function (err, result5) {
                    if (err) callback(err);
                    callback(null, result5);

                });

                        },
            function (callback) {


                client.query(querySeninor2, function (err, result6) {
                    if (err) callback(err);
                    callback(null, result6);

                });

                        },
            function (callback) {


                client.query(querySeninor3, function (err, result7) {
                    if (err) callback(err);
                    callback(null, result7);

                });

                        },
            function (callback) {


                client.query(querySeninor4, function (err, result8) {
                    if (err) callback(err);
                    callback(null, result8);

                });

                        },
            function (callback) {


                client.query(queryPeriod, function (err, result9) {
                    if (err) callback(err);
                    callback(null, result9);

                });

                        },
function (callback) {


                client.query(queryRatingTopTwenty, function (err, result10) {
                    if (err) callback(err);
                    callback(null, result10);

                });

}],
        function (err, results) {
            // 在这里处理data和data2的数据,每个文件的内容从results中获取
            res.render('library', {
                user: req.session.user,
                title: 'Lend_history',
                totalCount: results[0].length,
                sumMoney: getSumMoney(results[0]),
                highestRating: results[3][0],
                lowestRating: results[1][0],
                booksWithDoubanRatingCount: results[2][0].count,
                booksWithDoubanRatingCountGT8: results[4].length,
                booksPeriodInfo: results[9],
                senior1: results[5][0].count,
                senior2: results[6][0].count,
                senior3: results[7][0].count,
                senior4: results[8][0].count,
                top_twenty_books: results[10]
            });

            console.log('总的借书量是' + results[0].length);
            console.log('书钱是' + getSumMoney(results[0]));

            console.log('最高评分的书是' + results[3][0].book_name + '评分是' + results[3][0].book_rating);
            console.log('最低评分的书是' + results[1][0].book_name + '评分是' + results[1][0].book_rating);
            console.log('拥有豆瓣评分的数量是' + results[2][0].count);
            console.log('其中大于8.0评分的数量是' + results[4].length);
        });

});

module.exports = router;