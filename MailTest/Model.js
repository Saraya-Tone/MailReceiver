// Global Var
attachedFilePath = "C:/Users/tone/Documents/Wakanda/attachedfiles/";
//attachedFilePath = "/Users/kuni/Documents/Wakanda/Attached/";

folders = new Array(); // メールの件名に含まれる文字列に応じてサブフォルダを決定

folders[0] = "Dongguan";
folders[1] = "Shanghai";
folders[2] = "Thai";

folderNumbers = folders.length;

function getpath(subject) {
	for (i=0; i<folderNumbers; i++) {
		var ix = subject.indexOf(folders[i]);
		if (subject.indexOf(folders[i]) >= 0 ) {
			return ( attachedFilePath + folders[i] + "/");
		}	
	}	 
	return ( attachedFilePath + "Others/");
}

function receiveMailMain () {
	var pop3 = require("waf-mail/POP3");


	var allMails = [];


//	var addr = "pop.gmail.com"; 
//	var user = "yashi.receiver01@gmail.com";
//	var pass = "yashinomi2013";
//	var port = 995;
//	var isSSL = true;
	
	var addr = "post2.saraya.com"; 
	var user = "receiver@saraya.com";
	var pass = "password";
	var port = 110;
	var isSSL = false;
//	
//	var addr = "WEBAPP64.sarayajp.local"; 
//	var user = "info";
//	var pass = "yashinomi";
//	var port = 110;
//	var isSSL = false;
	
//	var addr = "post3.saraya.com"; 
//	var user = "test@mail.saraya.com";
//	var pass = "test";
//	var port = 110;
//	var isSSL = false;	
	
//	var date ; 

	var millseconds;


	var rc = pop3.getAllMail(addr, port , isSSL , user, pass, allMails ) 	;
	rc;


	allMails.forEach( function(oneMail) {

		var theMail = new ds.Mailbox(); 
		
		var msgid = oneMail["Message-ID"];
		if (msgid == undefined) {
			msgid = oneMail["Message-Id"];
		}	
	
		var found = ds.Mailbox.find("messageID = :1",msgid);
		
		if (found != null) return; // すでにメールがあれば以下の処理は実行しない 
		
		theMail.messageID = msgid; 
		theMail.s送信元 = oneMail["From"] ;
		theMail.s件名 =  oneMail["Subject"] ;
		var folderpath = getpath(theMail.s件名);
		
		theMail.s送信日付  = oneMail["Date"];
		
		theMail.isMIME = oneMail.isMIME();
		
		if (theMail.isMIME == true ) 
		{
			var parts=oneMail.getMessageParts();
			var aPart;     // メールのMIMEパート 
			var mediaType; // MIME Type
			var filename ; // 添付ファイル名
			
			
			theMail.s本文=" ";
			
			var len = parts.length;
			for (i=0;i<len;i++) {	
				aPart = parts[i];
				mediaType = aPart.mediaType;
				filename =  aPart.fileName;
				theMail.s本文 = theMail.s本文+"\n("+i+") Type="+mediaType+",filename="+filename;
				
				if (filename != "" ) 
				{
					aPart.save(folderpath,true); //添付ファイルを外部フォルダに保存
					
					// 添付ファイル情報の保存
					var theAttachment = new ds.Attachment();
					theAttachment.sファイル名 = filename;
					theAttachment.nサイズ = aPart.size;
					
					theMail.save();   			// メールデータ保存
					var key = theMail.getKey();
					theAttachment.mailbox = (key);
					
					theAttachment.a添付ファイル = aPart.asBlob;
					
					theAttachment.save();		// 添付ファイルデータ保存
					
					
					
				} else {
					theBody = oneMail.getBody();
					if (theBody != null)
					{
						theMail.s本文 = theMail.s本文 + "\n"+ oneMail.getBody().join("\n");
					}
				}	
				
				
			};
		} else {	
			var body = oneMail.getBody();
			theMail.s本文 = body.join("\n");
		}
		

		theMail.save();	// メールデータ保存

	});
	
	return;
}

guidedModel =// @startlock
{
	Mailbox :
	{
		s送信日付表示用 :
		{
			onGet:function()
			{// @endlock
				var wkdate = this.s送信日付;
				var millseconds = Date.parse(wkdate);
				var date2 = new Date();
				date2.setTime(millseconds);
				
				yy = date2.getFullYear();
				mm = date2.getMonth() + 1;
				dd = date2.getDate();
				hh = date2.getHours();
				minutes = date2.getMinutes();
				ss = date2.getSeconds();

				if (mm < 10) { mm = "0" + mm; }
				if (dd < 10) { dd = "0" + dd; }
				if (hh < 10) { hh = "0" + hh; }
				if (minutes < 10) { minutes = "0" + minutes; }
				if (ss < 10) { ss = "0" + ss; }

				formatedDate = yy + "/" + mm + "/" + dd + " " + hh + ":" + minutes + ":" + ss

				return formatedDate;
				
				// end function
			}// @startlock
		},
		collectionMethods :
		{// @endlock
			getNewMailCollection:function()
			{// @lock
				receiveMailMain ();
			}// @startlock
		},
		methods :
		{// @endlock
			getNewMails:function()
			{// @lock
				receiveMailMain ();
			},// @lock
			saveSelectedFiles:function(id)
			{// @lock
				var theMail = ds.Mailbox(id); 
				
				fileArray = theMail.attachments;
				var folderpath = getpath(theMail.s件名);

				fileArray.forEach( function(oneFile) 
				{
					var theBlob = oneFile.a添付ファイル; 
					var filename = oneFile.sファイル名;

					var dataFile = File(folderpath + filename );    	
					
					theBlob.copyTo(dataFile,"OverWrite");
					
				});
			}// @startlock
		}
	}
};// @endlock
