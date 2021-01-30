const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
var User = require('../models/user');
const codeforcesRouter = express.Router();
codeforcesRouter.use(bodyParser.json());
var authenticate = require('../authenticate');
const api = require('../api/codeforces');
const request = require('request');

codeforcesRouter.route('/')
    .get(authenticate.verifyUser, (req, res, next) => {
        User.findOne({
                username: req.user.username
            })
            .then((user) => {
                resp = {};
                resp.success = true;
                request(api.info + user.codeforces_handle, {
                    json: true
                }, (err, comment, result) => {
                    if (err) {
                        resp.success = false;
                    } else {
                        if (result.status == 'FAILED') {
                            resp.success = false;
                        } else {
                            resp.info = result.result;
                        }
                    }
                    request(api.rating + user.codeforces_handle, {
                        json: true
                    }, (err, comment, result) => {
                        if (err) {
                            resp.success = false;
                        } else {
                            if (result.status === 'FAILED') {
                                resp.success = false;
                            } else {
                                resp.rating = result.result;
                            }
                        }
                        request(api.submissions + user.codeforces_handle + api.count, {
                            json: true
                        }, (err, comment, result) => {
                            if (err) {
                                resp.success = false;
                            } else {

                                if (result.status === 'FAILED') {
                                    resp.success = false;
                                } else {
                                    resp.submissions = result.result;
                                }
                            }
                            if (resp.success === true) {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(resp);
                            } 
                            else {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json({success:false});
                            }
                        });
                    });
                });

            }, (err) => next(err))
            .catch((err) => next(err));
    })

codeforcesRouter.route('/')
    .post(authenticate.verifyUser, (req, res, next) => {
        User.findOne({
                username: req.user.username
            })
            .then((user) => {
                resp = {};
                resp.success = true;
                request(api.info + req.body.codeforces, {
                    json: true
                }, (err, comment, result) => {
                    if (err) {
                        resp.success = false;
                    } else {
                        if (result.status == 'FAILED') {
                            //res.statusCode = 400;
                            //res.setHeader('Content-Type', 'application/json');
                            resp.success = false;
                        } else {
                            resp.info = result.result;
                        }
                    }
                    request(api.rating + req.body.codeforces, {
                        json: true
                    }, (err, comment, result) => {
                        if (err) {
                            resp.success = false;
                        } else {
                            if (result.status === 'FAILED') {
                                resp.success = false;
                            } else {
                                resp.rating = result.result;
                            }
                        }
                        request(api.submissions + req.body.codeforces + api.count, {
                            json: true
                        }, (err, comment, result) => {
                            if (err) {
                                resp.success = false;
                            } else {

                                if (result.status === 'FAILED') {
                                    resp.success = false;
                                } else {
                                    resp.submissions = result.result;
                                }
                            }
                            if (resp.success === true) {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(resp);
                            } else {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json({success:false});
                            }
                        });
                    });
                });

            }, (err) => next(err))
            .catch((err) => next(err));
    })

codeforcesRouter.route('/compare')
    .post(authenticate.verifyUser, (req, res, next) => {
        resp = {};
        resp.success = true;
        resp.h1 = req.body.h1;
        resp.h2 = req.body.h2;
        resp.rating = {};
        resp.friends = {};
        resp.contribution = {};
        resp.rank = {};
        resp.maxRank = {};
        resp.maxRating = {};
        resp.contests = {};
        resp.submissions = {};
        resp.accuracy = {};
        request(api.info + req.body.h1, {
            json: true
        }, (err, comment, result) => {
            if (err) {
                resp.success = false;
            } else {
                if (result.status == 'FAILED') {
                    resp.success = false;
                } else {
                    resp.rating.h1 = result.result[0].rating;
                    resp.friends.h1 = result.result[0].friendOfCount;
                    resp.contribution.h1 = result.result[0].contribution;
                    resp.rank.h1 = result.result[0].rank;
                    resp.maxRank.h1 = result.result[0].maxRank;
                    resp.maxRating.h1 = result.result[0].maxRating;
                }
            }
            request(api.rating + req.body.h1, {
                json: true
            }, (err, comment, result) => {
                if (err) {
                    resp.success = false;
                } else {
                    if (result.status === 'FAILED') {
                        resp.success = false;
                    } else {
                        resp.contests.h1 = result.result.length;
                    }
                }
                request(api.submissions + req.body.h1 + api.count, {
                    json: true
                }, (err, comment, result) => {
                    if (err) {
                        resp.success = false;
                    } else {

                        if (result.status === 'FAILED') {
                            resp.success = false;
                        } else {
                            var obj = result.result;
                            var acc = 0;
                            for (var i = 0; i < obj.length; i++) {
                                if (obj[i].verdict === 'OK') {
                                    acc++;
                                }
                            }
                            var accuracyy = acc / obj.length;
                            resp.submissions.h1 = result.result.length;
                            accuracyy = accuracyy * 100;
                            accuracyy = Math.floor(accuracyy);
                            resp.accuracy.h1 = accuracyy;
                        }
                    }
                    request(api.info + req.body.h2, {
                        json: true
                    }, (err, comment, result) => {
                        if (err) {
                            resp.success = false;
                        } else {
                            if (result.status == 'FAILED') {
                                resp.success = false;
                            } else {
                                resp.rating.h2 = result.result[0].rating;
                                resp.friends.h2 = result.result[0].friendOfCount;
                                resp.contribution.h2 = result.result[0].contribution;
                                resp.rank.h2 = result.result[0].rank;
                                resp.maxRank.h2 = result.result[0].maxRank;
                                resp.maxRating.h2 = result.result[0].maxRating;
                            }
                        }
                        request(api.rating + req.body.h2, {
                            json: true
                        }, (err, comment, result) => {
                            if (err) {
                                resp.success = false;
                            } else {
                                if (result.status === 'FAILED') {
                                    resp.success = false;
                                } else {
                                    resp.contests.h2 = result.result.length;
                                }
                            }
                            request(api.submissions + req.body.h2 + api.count, {
                                json: true
                            }, (err, comment, result) => {
                                if (err) {
                                    resp.success = false;
                                } else {

                                    if (result.status === 'FAILED') {
                                        resp.success = false;
                                    } else {
                                        var obj = result.result;
                                        var acc = 0;
                                        for (var i = 0; i < obj.length; i++) {
                                            if (obj[i].verdict === 'OK') {
                                                acc++;
                                            }
                                        }
                                        var accuracyy = acc / obj.length;
                                        resp.submissions.h2 = result.result.length;
                                        accuracyy = accuracyy * 100;
                                        accuracyy = Math.floor(accuracyy);
                                        resp.accuracy.h2 = accuracyy;
                                    }
                                }
                                res.json(resp);
                            });
                        });

                    });

                });
            });
        });
    })

module.exports = codeforcesRouter;
