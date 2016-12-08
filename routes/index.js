'use strict';
const user=require('./user');
const library=require('./library');
const app=require('../WebApp');

app.route('/init','post',library.init);					
app.route('/addBook','post',library.addBook)
app.route('/addCnt','post',library.addCnt)
app.route('/reduceCnt','post',library.reduceCnt)
app.route('/changeInfo','post',library.changeInfo)
app.route('/queryBook','post',library.queryBook)
app.route('/addUsr','post',user.addUsr)
app.route('/deleteUsr','post',user.deleteUsr)			
app.route('/changeUsrInfo','post',user.changeUsrInfo)
app.route('/queryUsr','post',user.queryUsr)	
app.route('/borrowList','post',library.borrowList)
app.route('/borrowBook','post',library.borrowBook)		
app.route('/returnBook','post',library.returnBook)
app.route('/overdueList','post',library.overdueList)



