'use strict';
const HTM=require('../lib').html;
const db=require("../coSqlite3");

exports.addUsr=function*(req,res)
{
	let body=req.body;
	body.rID=body.rID || '';
	body.rName=body.rName || '';
	body.rSex=body.rSex || '';
	body.rDept=body.rDept || '';
	body.rGrade=body.rGrade || '';
	
	
	
	let correct="<div id=\'result\' style=\'display:none\'>0</div>";
	let exist="<div id=\'result\' style=\'display:none\'>1</div>"
	let argError="<div id=\'result\' style=\'display:none\'>2</div>"
	if(!body.rID || !body.rName|| !body.rSex || !body.rDept|| !body.rGrade)
		return HTM.begin+argError+'提交的参数有误：参数不可为空'+HTM.end;

	if(body.rID.length>8)
		return HTM.begin+argError+'提交的参数有误：证号的长度不能超过8个字符'+HTM.end;	
	if(body.rDept.length>10||body.rName.length>10)
		return HTM.begin+argError+'提交的参数有误：姓名、系名不能超过10个字符'+HTM.end;
	if((body.rSex!="男")&&(body.rSex!="女"))
		return HTM.begin+argError+'提交的参数有误：性别应为男或女'+HTM.end;
	var grade=parseInt(body.rGrade,10);
	if(isNaN(grade))
		return HTM.begin+argError+'提交的参数有误：年级应为数字'+HTM.end;
	if(grade+''!=body.rGrade)
		return HTM.begin+argError+'提交的参数有误：年级应为整数'+HTM.end;
	if(grade<0)
		return HTM.begin+argError+'提交的参数有误：年级应为正整数'+HTM.end;
	
	let rows=yield db.execSQL("select count(*) as cnt from UsrTable where rID=?",[body.rID]);
	if(rows[0].cnt>0)
		return HTM.begin+exist+'该证号已存在'+HTM.end;
	

	yield db.execSQL("INSERT INTO UsrTable(rID,rName,rSex,rDept,rGrade) VALUES(?,?,?,?,?)",[body.rID,body.rName,body.rSex,body.rDept,body.rGrade]);
	
	return HTM.begin+correct+'成功'+HTM.end;
}


exports.deleteUsr=function*(req,res)
{
	let body=req.body;
	body.rID=body.rID || '';
	
	let correct="<div id=\'result\' style=\'display:none\'>0</div>";
	let exist="<div id=\'result\' style=\'display:none\'>1</div>"
	let argError="<div id=\'result\' style=\'display:none\'>2</div>"
	
	let rows=yield db.execSQL("select count(*) as cnt from UsrTable where rID=?",[body.rID]);
	if(rows[0].cnt<=0)
		return HTM.begin+exist+'该证号不存在'+HTM.end;
	
	rows=yield db.execSQL("select count(*) as cnt from borrowList where  rID=?",[body.rID]);
	if(rows[0].cnt>0)
		return HTM.begin+argError+'该读者尚有书籍未归还'+HTM.end;
	
	yield db.execSQL("delete from UsrTable where rID=?",[body.rID]);
	
	return HTM.begin+correct+'成功'+HTM.end;
	
	
	
}


exports.changeUsrInfo=function*(req,res)
{
	let body=req.body;
	body.rID=body.rID || '';
	body.rName=body.rName || '';
	body.rSex=body.rSex || '';
	body.rDept=body.rDept || '';
	body.rGrade=body.rGrade || '';
	
	let correct="<div id=\'result\' style=\'display:none\'>0</div>";
	let exist="<div id=\'result\' style=\'display:none\'>1</div>"
	let argError="<div id=\'result\' style=\'display:none\'>2</div>"
	
	if(!body.rID || !body.rName|| !body.rSex || !body.rDept|| !body.rGrade)
		return HTM.begin+argError+'提交的参数有误：参数不可为空'+HTM.end;

	if(body.rID.length>8)
		return HTM.begin+argError+'提交的参数有误：证号的长度不能超过8个字符'+HTM.end;	
	if(body.rDept.length>10||body.rName.length>10)
		return HTM.begin+argError+'提交的参数有误：姓名、系名不能超过10个字符'+HTM.end;
	if((body.rSex!="男")&&(body.rSex!="女"))
		return HTM.begin+argError+'提交的参数有误：性别应为男或女'+HTM.end;
	var grade=parseInt(body.rGrade,10);
	if(isNaN(grade))
		return HTM.begin+argError+'提交的参数有误：年级应为数字'+HTM.end;
	if(grade+''!=body.rGrade)
		return HTM.begin+argError+'提交的参数有误：年级应为整数'+HTM.end;
	if(grade<0)
		return HTM.begin+argError+'提交的参数有误：年级应为正整数'+HTM.end;
	
	let rows=yield db.execSQL("select count(*) as cnt from UsrTable where rID=?",[body.rID]);
	if(rows[0].cnt<=0)
		return HTM.begin+exist+'该证号不存在'+HTM.end;
	

	yield db.execSQL("Update UsrTable set rName=?,rSex=?,rDept=?,rGrade=? where rID=?",[body.rName,body.rSex,body.rDept,body.rGrade,body.rID]);
	
	return HTM.begin+correct+'成功'+HTM.end;
}

exports.queryUsr=function*(req,res)
{
	let body=req.body;
	body.rID=body.rID || '';
	body.rName=body.rName || '';
	body.rSex=body.rSex || '';
	body.rDept=body.rDept || '';
	body.rGrade0=body.rGrade0 || '';
	body.rGrade1=body.rGrade1 || '';
	
	let htm='<table border=1 id=\'result\'>'
	var str="select * from UsrTable ";
	if(body.rID)
		str=str+"where rID like  '%"+body.rID+"%'";
	if(body.rName){
		if(!body.rID)
			str+="where rName like  '%"+body.rName+"%'";
		else
			str+="and rName like  '%"+body.rName+"%'";
	}
	if(body.rSex){
		if(!body.rID&&!body.rName)
			str+="where rSex like  '%"+body.rSex+"%'";
		else
			str+="and rSex like  '%"+body.rSex+"%'";
	}
	if(body.rDept){
		if(!body.rID&&!body.rName&&!body.rSex)
			str+="where rDept like  '%"+body.rDept+"%'";
		else
			str+="and rDept like  '%"+body.rDept+"%'";
	}
	if(body.rGrade0){
		if(!body.rID&&!body.rName&&!body.rDept&&!body.rSex){
			if(!body.rGrade1){
				str+=" where rGrade>='"+body.rGrade0+"'";
			}else{
				str+="where rGrade between '"+body.rGrade0+"'" +"and '"+body.rGrade1+"'";
			}
		}else{
			if(!body.rGrade1){
				str+=" and rGrade>='"+body.rGrade0+"'";
			}else{
				str+="and rGrade between '"+body.rGrade0+"'" +"and '"+body.rGrade1+"'";
			}
			
		}
	}else{
		if(!body.rID&&!body.rName&&!body.rDept&&!body.rSex&&body.rGrade1){
				str+=" where rGrade<='"+body.rGrade1+"'";
		}		
		else{
			if(body.bDate1)
		
				str+=" and rGrade<='"+body.rGrade1+"'";	
		}
	}
	
	let rows=yield db.execSQL(str);
	for(let row of rows)
		htm+='<tr><td>'+row.rID.toHTML()+'</td><td>'
			+row.rName.toHTML()+'</td><td>'
			+row.rSex.toHTML()+'</td><td>'
			+row.rDept+'</td><td>'
			+row.rGrade+'</td></tr>';
	htm+='</table>';
	
	return HTM.begin+str+htm+HTM.end;
}

