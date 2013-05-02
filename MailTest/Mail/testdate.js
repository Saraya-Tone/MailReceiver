//文字列からミリ秒を取得
var time = Date.parse("Fri, 12 Apr 2013 5:5:3 +0900");
time = 1365991089000;
//ミリ秒から日付を求める
var date = new Date();
date.setTime(time);

yy = date.getFullYear();
mm = date.getMonth() + 1;
dd = date.getDate();
hh = date.getHours();
minutes = date.getMinutes();
ss = date.getSeconds();


if (mm < 10) { mm = "0" + mm; }
if (dd < 10) { dd = "0" + dd; }
if (hh < 10) { hh = "0" + hh; }
if (minutes < 10) { minutes = "0" + minutes; }
if (ss < 10) { ss = "0" + ss; }

formatedDate = yy + "/" + mm + "/" + dd + " " + hh + ":" + minutes + ":" + ss;

//isoString = dateToIso(date);

//alocaltime = date.toLocaleString();
// formatedateate = dateToIso(date);