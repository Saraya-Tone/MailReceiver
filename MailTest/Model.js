// Global Var
attachedFilePath = "C:/MailReceiver/attachedfiles/";
//attachedFilePath = "C:/Users/tone/Documents/Wakanda/attachedfiles/";
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
		theMail.sender = oneMail["From"] ;
		theMail.title =  oneMail["Subject"] ;
		var folderpath = getpath(theMail.title);
		
		theMail.sentDate  = oneMail["Date"];
		
		theMail.isMIME = oneMail.isMIME();
		
		if (theMail.isMIME == true ) 
		{
			var parts=oneMail.getMessageParts();
			var aPart;     // メールのMIMEパート 
			var mediaType; // MIME Type
			var filename ; // 添付ファイル名
			
			
			theMail.bodyText=" ";
			theMail.savedFilecount = 0;
			theMail.allSaved = true;
			
			
			var len = parts.length;
			var savestat = 9;   
			
			for (i=0;i<len;i++) {	
				aPart = parts[i];
				mediaType = aPart.mediaType;
				filename =  aPart.fileName;
				theMail.bodyText = theMail.bodyText+"\n("+i+") Type="+mediaType+",filename="+filename;
				
				if (filename != "" ) 
				{
					var fileobj = File(folderpath+filename);
					if (fileobj.exists) 
					{
						savestat = 1;  // ファイルあり、上書き不可
						theMail.allSaved = false;
//						aPart.save(folderpath,true); //添付ファイルを外部フォルダに上書き保存

					} else 
					{
						savestat = 2;  // ファイルなし、新規保存
						aPart.save(folderpath); //添付ファイルを外部フォルダに保存
						theMail.savedFilecount++;
					}		

										
					// 添付ファイル情報の保存
					var theAttachment = new ds.Attachment();
					theAttachment.afileName = filename;
					theAttachment.afileSize = aPart.size;
					theAttachment.afileStatus = savestat;					
					
					theMail.save();   			// メールデータ保存
					var key = theMail.getKey();
					theAttachment.mailbox = (key);
					
					theAttachment.afile = aPart.asBlob;
					
					theAttachment.save();		// 添付ファイルデータ保存
					
					
					
				} else {
					theBody = oneMail.getBody();
					if (theBody != null)
					{
						theMail.bodyText = theMail.bodyText + "\n"+ oneMail.getBody().join("\n");
					}
				}	
				
				
			};
		} else {	
			var body = oneMail.getBody();
			theMail.bodyText = body.join("\n");
		}
		

		theMail.save();	// メールデータ保存

	});
	
	return;
}

guidedModel =// @startlock
{
	Mailbox :
	{
		dateString :
		{
			onGet:function()
			{// @endlock
				var wkdate = this.sentDate;
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
				var folderpath = getpath(theMail.title);

				fileArray.forEach( function(oneFile) // 全ファイル上書き保存
				{
					var theBlob = oneFile.afile; 
					var filename = oneFile.afileName;
					oneFile.afileStatus = 3;   //  全ファイル上書き保存による保存
					var dataFile = File(folderpath + filename );    	
					
					theBlob.copyTo(dataFile,"OverWrite");
					
				});
				theMail.allSaved = true;
				theMail.save(); 
			}// @startlock
		}
	}
};// @endlock
