'use strict';
const HTM=require('../lib').html;
const db=require("../coSqlite3");
const StrTime=require('../lib').StrTime;

//app.route('/initialization','post',library.initialization);
exports.init=function*(req,res)
{
	
	let createLib="CREATE TABLE LIBRARY("
	+"bID CHAR(30) PRIMARY KEY    NOT NULL,"
	+"bName          CHAR(30)     NOT NULL,"
	+"bPub           CHAR(30)     NOT NULL,"
	+"bDate          datetime	  Not NULL,"
	+"bAuthor        CHAR(20)	  Not NULL,"
	+"bMem           CHAR(30)     Not NULL,"
	+"bCnt				INT       Not NULL,"
	+"bCntN				INT		  Not Null);"
	
	let usrList="CREATE TABLE UsrTable("
	+"rID	char(8) PRIMARY KEY     NOT NULL,"
	+"rName	char(10)				Not null,"
	+"rSex	char(2)					not null,"
	+"rDept char(10)				not null,"
	+"rGrade int(3)					not null);"
	
	let borrowList="CREATE table borrowlist("
	+"rID char(9)	not null ,"
	+"bID char(30)	not null,"
	+"borrowTime datatime not null,"
	+"FOREIGN KEY (rID) REFERENCES UsrTable(rID),"
	+"FOREIGN KEY (bID) REFERENCES LIBRARY(bID));"
	
	try{
		yield db.execSQL(createLib);
		yield db.execSQL(usrList);
		yield db.execSQL(borrowList);
		return HTM.begin+"<div id=\'result\' style=\'display:none\'>0</div>"+"成功"+HTM.end;
	}catch(e){
		return HTM.begin+"<div id=\'result\' style=\'display:none\'>1</div>"+"初始化失败"+HTM.end;
	}
	
};

exports.addBook=function*(req,res)
{
	let body=req.body;
	body.bID=body.bID || '';
	body.bName=body.bName || '';
	body.bPub=body.bPub || '';
	body.bDate=body.bDate || '';
	body.bAuthor=body.bAuthor || '';
	body.bMem=body.bMem || '';
	body.bCnt=body.bCnt || '';
	body.bID=body.bID.trim();
	
	var reg=/^((?:19|20)\d\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
	var res = reg.test(body.Date);   
	
	let correct="<div id=\'result\' style=\'display:none\'>0</div>";
	let exist="<div id=\'result\' style=\'display:none\'>1</div>"
	let argError="<div id=\'result\' style=\'display:none\'>2</div>"
	if(!body.bID || !body.bName|| !body.bPub || !body.bDate|| !body.bAuthor|| !body.bMem|| !body.bCnt)
		return HTM.begin+argError+'提交的参数有误：参数不可为空'+HTM.end;

	if(body.bID.length>30 || body.bName.length>30 || body.bPub.length>30 || body.bMem.length>30 )
		return HTM.begin+argError+'提交的参数有误：书号、书名、出版社或内容摘要长度不能超过30字符'+HTM.end;
	
	if(body.bAuthor.length>20)
		return HTM.begin+argError+'提交的参数有误：作者长度不能超过20个字符'+HTM.end;
	
	if(parseInt(body.bCnt)<=0)
		return HTM.begin+argError+'提交的参数有误：书的数量不能小于0'+HTM.end;
	if(!reg.test(body.bDate))
		return HTM.begin+argError+'提交的参数有误：日期格式错误！'+HTM.end;

	let rows=yield db.execSQL("select count(*) as cnt from LIBRARY where bID=?",[body.bID]);
	if(rows[0].cnt>0)
		return HTM.begin+exist+'该书已存在'+HTM.end;
	

	yield db.execSQL("INSERT INTO LIBRARY(bID,bName,bPub,bDate,bAuthor,bMem,bCnt,bCntN) VALUES(?,?,?,?,?,?,?,?)",[body.bID,body.bName,body.bPub,body.bDate,body.bAuthor,body.bMem,body.bCnt,body.bCnt]);
	
	return HTM.begin+correct+'成功'+HTM.end;
}

exports.addCnt=function*(req,res)
{
	let body=req.body;
	body.bID=body.bID || '';
	body.bCnt=body.bCnt || '';
	body.bID=body.bID.trim();
	var curCnt=0;
	var curCntN=0;
	
	
	let correct="<div id=\'result\' style=\'display:none\'>0</div>";
	let exist="<div id=\'result\' style=\'display:none\'>1</div>"
	let argError="<div id=\'result\' style=\'display:none\'>2</div>"
	

	let rows=yield db.execSQL("select count(*) as cnt from LIBRARY where bID=?",[body.bID]);
	if(rows[0].bCnt<=0)
		return HTM.begin+exist+'该书不存在'+HTM.end;
	
	if(body.bCnt<=0)
		return HTM.begin+argError+'提交的参数有误：书的数量不能小于0'+HTM.end;
	
	rows=yield db.execSQL("SELECT bCnt,bCntN FROM LIBRARY where bID=?",[body.bID]);
	for(let row of rows){
		curCnt=row.bCnt;
		curCntN=row.bCntN;
	}
	console.log(curCntN);
	curCnt=parseInt(curCnt)+parseInt(body.bCnt);
	curCntN=parseInt(curCntN)+parseInt(body.bCnt);
	yield db.execSQL("Update LIBRARY set bCnt=?,bCntN=? where bId=?",[curCnt,curCntN,body.bID]);
	
		
	return HTM.begin+correct+'成功'+HTM.end;
}

exports.reduceCnt=function*(req,res)
{
	let body=req.body;
	body.bID=body.bID || '';
	body.bCnt=body.bCnt || '';
	body.bID=body.bID.trim();
	var curCnt=0;
	var curCntN=0;
	
	
	let correct="<div id=\'result\' style=\'display:none\'>0</div>";
	let exist="<div id=\'result\' style=\'display:none\'>1</div>"
	let numError="<div id=\'result\' style=\'display:none\'>2</div>"
	let argError="<div id=\'result\' style=\'display:none\'>3</div>"
	

	let rows=yield db.execSQL("select count(*) as cnt from LIBRARY where bID=?",[body.bID]);
	if(rows[0].cnt<=0)
		return HTM.begin+exist+'该书不存在'+HTM.end;
	if(!body.bID || !body.bCnt)
		return HTM.begin+argError+'提交的参数有误：参数不可为空'+HTM.end;
	if((body.bCnt%1)!=0)
		return HTM.begin+argError+'提交的参数有误：书的数量应为数字'+HTM.end;
	if(body.bCnt<=0)
		return HTM.begin+argError+'提交的参数有误：书的数量不能小于0'+HTM.end;
	
	rows=yield db.execSQL("SELECT bCntN,bCnt FROM LIBRARY where bID=?",[body.bID]);
	for(let row of rows){
		curCntN=row.bCntN;
		curCnt=row.bCnt;
	}
	if(parseInt(curCntN)<parseInt(body.bCnt))
		return HTM.begin+numError+'减少的数量大于该书目前在库数量'+HTM.end;
	curCnt=parseInt(curCnt)-parseInt(body.bCnt);
	curCntN=parseInt(curCntN)-parseInt(body.bCnt);
	yield db.execSQL("Update LIBRARY set bCnt=?,bCntN=? where bId=?",[curCnt,curCntN,body.bID]);
	
	return HTM.begin+correct+'成功'+HTM.end;
}

exports.changeInfo=function*(req,res)
{
	let body=req.body;
	body.bID=body.bID || '';
	body.bName=body.bName || '';
	body.bPub=body.bPub || '';
	body.bDate=body.bDate || '';
	body.bAuthor=body.bAuthor || '';
	body.bMem=body.bMem || '';
	body.bCnt=body.bCnt || '';
	body.bID=body.bID.trim();
	
	var reg=/^((?:19|20)\d\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
	var res = reg.test(body.Date);   
	
	let correct="<div id=\'result\' style=\'display:none\'>0</div>";
	let exist="<div id=\'result\' style=\'display:none\'>1</div>"
	let argError="<div id=\'result\' style=\'display:none\'>2</div>"
	
	if(!body.bID || !body.bName|| !body.bPub || !body.bDate|| !body.bAuthor|| !body.bMem)
		return HTM.begin+argError+'提交的参数有误：参数不可为空'+HTM.end;
	
	let rows=yield db.execSQL("select count(*) as cnt from LIBRARY where bID=?",[body.bID]);
	if(rows[0].cnt<=0)
		return HTM.begin+exist+'该书不存在'+HTM.end;

	if(body.bID.length>30 || body.bName.length>30 || body.bPub.length>30 || body.bMem.length>30 )
		return HTM.begin+argError+'提交的参数有误：书号、书名、出版社或内容摘要长度不能超过30字符'+HTM.end;
	
	if(body.bAuthor.length>20)
		return HTM.begin+argError+'提交的参数有误：作者长度不能超过20个字符'+HTM.end;
	
	if(!reg.test(body.bDate))
		return HTM.begin+argError+'提交的参数有误：日期格式错误！'+HTM.end;
	
	

	yield db.execSQL("Update LIBRARY set bName=?,bPub=?,bDate=?,bAuthor=?,bMem=? where bId=?",[body.bName,body.bPub,body.bDate,body.bAuthor,body.bMem,body.bID]);
	
	return HTM.begin+correct+'成功'+HTM.end;
}

exports.queryBook=function*(req,res)
{
	let body=req.body;
	body.bID=body.bID || '';
	body.bName=body.bName || '';
	body.bPub=body.bPub || '';
	body.bDate0=body.bDate0 || '';
	body.bDate1=body.bDate1 || '';
	body.bAuthor=body.bAuthor || '';
	body.bMem=body.bMem || '';
	
	body.bID=body.bID.trim();
	let htm='<table border=1 id=\'result\'>'
	
	var str="select * from LIBRARY ";
	if(body.bID)
		str=str+"where bID like  '%"+body.bID+"%'";
	if(body.bName){
		if(!body.bID)
			str+=" where bName like '%"+body.bName+"%'";
		else
			str=str+"and  bName like '%"+body.bName+"%'";
	}
	if(body.bPub){
		if(!body.bID&!body.bName)
			str+="where bPub like '%"+body.bPub+"%'";
		else
			str=str+"and  bPub like '%"+body.bPub+"%'";
	}
	if(body.bAuthor){
		if(!body.bID&&!body.bName&&!body.bPub)
			str+=" where bAuthor like '%"+body.bAuthor+"%'";
		else
			str+=" and  bAuthor like '%"+body.bAuthor+"%'";
			
	}
	if(body.bMem){
		if(!body.bID&&!body.bName&&!body.bPub&&!body.bAuthor)
			str+=" where bMem like '%"+body.bMem+"%'";
		else
			str+=" and  bMem like '%"+body.bMem+"%'";
			
	}
	if(body.bDate0){
		if(!body.bID&&!body.bName&&!body.bPub&&!body.bAuthor){
			if(!body.bDate1){
				str+=" where bDate>='"+body.bDate0+"'";
			}else{
				str+="where bDate between '"+body.bDate0+"'" +"and '"+body.bDate1+"'";
			}
		}else{
			if(!body.bDate1){
				str+=" and bDate>='"+body.bDate0+"'";
			}else{
				str+="and bDate between '"+body.bDate0+"'" +"and '"+body.bDate1+"'";
			}
			
		}
	}else{
		if(!body.bID&&!body.bName&&!body.bPub&&!body.bAuthor&&body.bDate1){
				str+=" where bDate<='"+body.bDate1+"'";
		}		
		else{
			if(body.bDate1)
				str+=" and bDate<='"+body.bDate1+"'";
				
		}
	}
	
	let rows=yield db.execSQL(str);
	for(let row of rows)
		htm+='<tr><td>'+row.bID.toHTML()+'</td><td>'
			+row.bName.toHTML()+'</td><td>'
			+row.bCnt+'</td><td>'
			+row.bCntN+'</td><td>'
			+row.bPub.toHTML()+'</td><td>'
			+row.bDate.toHTML()+'</td><td>'
			+row.bAuthor.toHTML()+'</td><td>'
			+row.bMem+'</td></tr>';
	htm+='</table>';
	
	return HTM.begin+str+htm+HTM.end;
}


exports.borrowList=function*(req,res)
{
	let body=req.body;
	body.rID=body.rID || '';
	let htm='<table border=1 id=\'result\'>'
	let correct="<div id=\'result\' style=\'display:none\'>0</div>";
	let exist="<div id=\'result\' style=\'display:none\'>1</div>"
	
	let rows=yield db.execSQL("select count(*) as cnt from UsrTable where rID=?",[body.rID]);
	if(rows[0].cnt<=0)
		return HTM.begin+exist+'该证号不存在'+HTM.end;
	
	rows=yield db.execSQL("select LIBRARY.bID,LIBRARY.bName,borrowTime FROM LIBRARY INNER JOIN borrowList ON LIBRARY.bID=borrowList.bID where rID=?",[body.rID]);
	for(let row of rows)
		htm+='<tr><td>'+row.bID+'</td><td>'
			+row.bName+'</td><td>'
			+format(row.borrowTime)+'</td><td>'
			+format(row.borrowTime+2592000)+'</td><td>'
			+overdue1(row.borrowTime)+'</td></tr>';
	htm+='</table>';
	
	
	return HTM.begin+htm+HTM.end;
}

exports.borrowBook=function*(req,res)
{
	let body=req.body;
	body.bID=body.bID || '';
	body.bID=body.bID || '';
	var curCntN,time;
	var time = Date.parse(new Date())/1000;
	//var time='1439078496';
	let correct="<div id=\'result\' style=\'display:none\'>0</div>";
	let error1="<div id=\'result\' style=\'display:none\'>1</div>";
	let error2="<div id=\'result\' style=\'display:none\'>2</div>";
	let error3="<div id=\'result\' style=\'display:none\'>3</div>";
	let error4="<div id=\'result\' style=\'display:none\'>4</div>";
	let error5="<div id=\'result\' style=\'display:none\'>5</div>";
	
	let rows=yield db.execSQL("select count(*) as cnt from UsrTable where rID=?",[body.rID]);
	if(rows[0].cnt<=0)
		return HTM.begin+error1+'该证号不存在'+HTM.end;
	
	rows=yield db.execSQL("select count(*) as cnt from LIBRARY where bID=?",[body.bID]);
	if(rows[0].cnt<=0)
		return HTM.begin+error2+'该书不存在'+HTM.end;
	
	rows=yield db.execSQL("select borrowTime from borrowList where rID=?",[body.rID]);
	for(let row of rows){
		time=row.borrowTime;
		console.log(OverDue(time))
		if(OverDue(time)){
			return HTM.begin+error3+'该读者有超期书未还'+HTM.end;
			
		}
	}
	
	
	rows=yield db.execSQL("select count(*) as cnt from borrowList where bID=? and rID=?",[body.bID,body.rID]);
	if(rows[0].cnt>0)
		return HTM.begin+error4+'该读者已经借阅该书，且未归还'+HTM.end;
	
	rows=yield db.execSQL("SELECT bCntN FROM LIBRARY where bID=?",[body.bID]);
	for(let row of rows){
		curCntN=row.bCntN;
	}
	if(parseInt(curCntN)<=0)
		return HTM.begin+error5+'该书已经全部借出'+HTM.end;
	
	curCntN-=1;
	
		
	yield db.execSQL("INSERT INTO borrowList(bID,rID,borrowTime) VALUES(?,?,?)",[body.bID,body.rID,time]);
	yield db.execSQL("Update LIBRARY set bCntN=? where bId=?",[curCntN,body.bID]);
	return HTM.begin+correct+'成功'+HTM.end;
}

exports.returnBook=function*(req,res)
{
	let body=req.body;
	body.bID=body.bID || '';
	body.bID=body.bID || '';
	
	var curCntN;
	
	let correct="<div id=\'result\' style=\'display:none\'>0</div>";
	let error1="<div id=\'result\' style=\'display:none\'>1</div>";
	let error2="<div id=\'result\' style=\'display:none\'>2</div>";
	let error3="<div id=\'result\' style=\'display:none\'>3</div>";
	
	let rows=yield db.execSQL("select count(*) as cnt from UsrTable where rID=?",[body.rID]);
	if(rows[0].cnt<=0)
		return HTM.begin+error1+'该证号不存在'+HTM.end;
	
	rows=yield db.execSQL("select count(*) as cnt from LIBRARY where bID=?",[body.bID]);
	if(rows[0].cnt<=0)
		return HTM.begin+error2+'该书不存在'+HTM.end;
	
	rows=yield db.execSQL("select count(*) as cnt from borrowList where bID=? and rID=?",[body.bID,body.rID]);
	if(rows[0].cnt<=0)
		return HTM.begin+error3+'该读者未借阅该书'+HTM.end;
	
	rows=yield db.execSQL("SELECT bCntN FROM LIBRARY where bID=?",[body.bID]);
	for(let row of rows){
		curCntN=row.bCntN;
	}
	curCntN+=1;
	
	
	yield db.execSQL("delete from borrowList where rID=? and bID=?",[body.rID,body.bID]);
	yield db.execSQL("Update LIBRARY set bCntN=? where bId=?",[curCntN,body.bID]);
	return HTM.begin+correct+'成功'+HTM.end;
	
}

exports.overdueList=function*(req,res)
{
	let body=req.body;
		let htm='<table border=1 id=\'result\'>'
		
		let rows=yield db.execSQL("select borrowList.rID,rName,rSex,rDept,rGrade FROM UsrTable INNER JOIN borrowList ON UsrTable.rID=borrowList.rID where borrowTime<? group by borrowList.rID",[overdue2()]);
	
		for(let row of rows)
		htm+='<tr><td>'+row.rID+'</td><td>'
			+row.rName+'</td><td>'
			+row.rSex+'</td><td>'
			+row.rDept+'</td><td>'
			+row.rGrade+'</td></tr>';
		htm+='</table>';
	
	
	return HTM.begin+htm+HTM.end;
}

function overdue2(){
	var now = Date.parse(new Date())/1000;
	var time=now-86400*31;
	return time
	
}
function OverDue(time) {
  if (!time)
    return false;
	var overdue;
  var now, diff, ret, t,y,m,d,h,i;
  // 当前时间戳
  now = Date.parse(new Date())/1000;
  // 差值
  diff = now - time;
  // 设置时间
  ret = parseInt(diff/86400);
	if(ret>=30){
		overdue=true
	}else{
		overdue=false;
	}
	return overdue;
}

function overdue1(time){
	var result;
	if(OverDue(time))
		result="是";
	else
		result="否";
	return result;
}

function format(timeStamp)
{
//shijianchuo是整数，否则要parseInt转换
var time = new Date(timeStamp*1000);
var y = time.getFullYear();
var m = time.getMonth()+1;
var d = time.getDate();
return y+'-'+m+'-'+d;
}

