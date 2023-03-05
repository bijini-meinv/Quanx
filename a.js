
var cronsign = $environment.executeType == 0 || $environment.executeType == "0" || $environment.executeType == "-1"? "Y" : "N"
var policy = $environment.executeType == 0 || $environment.executeType == "0" || $environment.executeType == "-1"? GetPolicy($environment.sourcePath) : $environment.params

//要是执行失败的话 把下面一行注释//去掉
//console.log(JSON.stringify($environment))
console.log("策略组："+policy)

function GetPolicy(cnt) {
    if (cnt && cnt.indexOf("#policy=") !=-1) {
        return decodeURIComponent(cnt.split("#policy=")[1].trim())
    }else {
        return "自动选择"
    }
}

const message = {
    action: "get_customized_policy",
    content: policy

};

var output=[]
var OKList=[]
var NoList=[]
var ErrorList=[]
var pflag=1 //是否是策略，或者简单节点
var sign=0 //是否停止

$configuration.sendMessage(message).then(resolve => {
    if (resolve.error) {
        console.log(resolve.error);
        $done()
    }
    if (resolve.ret) {
        //console.log(JSON.stringify(resolve.ret))
        output=JSON.stringify(resolve.ret[message.content])? JSON.parse(JSON.stringify(resolve.ret[message.content]["candidates"])) : [policy]
        pflag = JSON.stringify(resolve.ret[message.content])? pflag:0
        console.log("Google 送中检测 检测")
        console.log("节点or策略组："+pflag)

        if (pflag==1) {
        console.log("节点数量："+resolve.ret[policy]["candidates"].length)
	console.log("\n开始检测-----------------------------------")	

        if(resolve.ret[policy]["candidates"].length==0) {
            $done({"title":"Google 送中检测","htmlMessage":`<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>😭 无有效节点</b>`});
        }
    }

        //$notify(typeof(output),output)
        Check()
        //$done({"title":"策略内容","message":output})
    }
}, reject => {
    // Normally will never happen.
    $done();
});

function Len(cnt) {
    return cnt.length-1
}

function Check() {
    var relay = 2000;
    for ( var i=0;i < output.length;i++) {
        testGoogle(output[i])
        }
    if (output.length<=5) {
        relay = 2000
    } else if (output.length<10) {
        relay =4000
    } else if (output.length<15) {
        relay =6000
    } else if (output.length<20) {
        relay =8000
    } else {
        relay =10000
    }
    console.log(output.length+":"+relay)
    setTimeout(() => {
	console.log("检测结束-------------------------------------")	    
        console.log("\n⛳️ 共计 "+OKList.length+" 个节点未送中 👇 ")
         for (var i = 0; i < OKList.length; i++) {
			console.log(OKList[i]);
		}
	console.log("--------------------------------------------")	       
        console.log("\n🏠 共计 "+Len(NoList)+" 个已送中节点 👇 ")
           for (var i = 0; i < NoList.length; i++) {
			console.log(NoList[i]);
		}
	console.log("---------------------------------------------")	           
        console.log("\n🕹 共计 "+Len(ErrorList)+" 个检测出错节点 👇 ")
           for (var i = 0; i < ErrorList.length; i++) {
			console.log(ErrorList[i]);
		}
        sign=1
        if (OKList[0] && pflag==1) { //有支持节点、且为策略组才操作
            ReOrder(OKList)
            } else if (!OKList[0]){ //不支持
                content =pflag==0 ? `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>😭 该节点已被 Google 送中 </b><br><br>👇<br><br><font color=#FF5733>-------------------------<br><b>⟦ `+policy+` ⟧ </b><br>-------------------------</font>`: `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "<br>❌  <b>⟦ "+policy+ " ⟧ </b>⚠️ 切换失败<br><br><b>该策略组内未找到未被 Google 送中</b> 的节点" + "<br><br><font color=#FF5733>-----------------------------<br><b>检测详情请查看JS脚本记录</b><br>-----------------------------</font>"+`</p>`
                //为节点且检测超时/出错
                content = pflag==0 && Len(NoList)==0 ? content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>⚠️ 该节点 Google 送中检测失败 </b><br><br>👇<br><br><font color=#FF5733>-------------------------<br><b>⟦ `+policy+` ⟧ </b><br>-------------------------</font>`: content
                $done({"title":"Google 送中检测&切换", "htmlMessage": content})
            } else if (OKList[0]){ //支持, 但为节点
            content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b> 🎉 该节点未被 Google 送中 </b><br><br>👇<br><br><font color=#FF5733>-------------------------<br><b>⟦ `+policy+` ⟧ </b><br>-------------------------</font>`
            $done({"title":"Google 送中检测&切换", "htmlMessage": content})
        } 
    }, relay)
    
}

//选择最优延迟节点
function ReOrder(cnt) {
    const array = cnt;
    const messageURL = {
    action: "url_latency_benchmark",
    content: array
};
    $configuration.sendMessage(messageURL).then(resolve => {
    if (resolve.error) {
        console.log(resolve.error);
    }
    if (resolve.ret) {
        let inputStr=JSON.stringify(resolve.ret);
	console.log("------------------------------------------\n")	           
        console.log("\n节点延迟：");
	const json = JSON.parse(inputStr);
	const keys = Object.keys(json).sort();

	for (const key of keys) {
	  console.log(`${key}: [${json[key].join(', ')}]`);
	}

	    
	   
        //排序
	console.log("------------------------------------------\n")	    
        console.log("排序前: ")
	  for (var i = 0; i < array.length; i++) {
		 console.log(array[i]);
	 }   
        if(array){
            try {
        array.sort(function (a,b) {
            //console.log(a+" VS "+b)
        return (resolve.ret[a][1]!=-1 && resolve.ret[b][1] !=-1)? resolve.ret[a][1]-resolve.ret[b][1] : resolve.ret[b][1]
    })
    } catch (err) {
        console.log(err)
    }
    }  
    console.log("\n排序后: ")
	     for (var i = 0; i < array.length; i++) {
		 console.log(array[i]);
	 }   
	    console.log("------------------------------------------\n")	    
    let Ping =resolve.ret[array[0]]
        const dict = { [policy] : array[0]};
        if(array[0]) {
            console.log("选定未被送中节点："+array[0]+"延迟数据为 👉"+Ping)
            Ping = " ⚡️ 节点延迟 ➟ 「 "+Ping + " 」 " 
			$notify("检测完成,当前最优节点👇", array[0] +"\n 👉 "+Ping)
		   $done()
        }

        $configuration.sendMessage(mes1).then(resolve => {
         
    }, reject => {
            $done();
        });
        
    }
    //$done();
}, reject => {
    // Normally will never happen.
    $done();
});
}


function testGoogle(pname) {
    return new Promise((resolve, reject) => {
        const url = `https://www.google.com/maps/timeline`;
        let opts = { policy : pname }
        const method = `GET`;
        const headers = {
            'Accept-Encoding' : `gzip, deflate, br`,
            'Connection' : `keep-alive`,
            'Accept' : `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
            'Host' : `www.google.com`,
            'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1`,
            'Accept-Language' : `zh-CN,zh-Hans;q=0.9`
        };
        const body = ``;
        const myRequest = {
            url: url,
            method: method,
            headers: headers,
            body: body,
            opts: opts,
            //timeout: 3000
        };
        
        $task.fetch(myRequest).then(response => {
            let sCode = response.statusCode
            hmessage = "该节点未被送中"
            //console.log(pname+sCode);
            if (sign==0) {
            if (sCode == 400) {
                NoList.push(pname)
                console.log(pname + ": 该节点已被送中 ->" +sCode)
                resolve("YES")
                return
            } else {
                OKList.push(pname)//结束前推送
                console.log(pname + ": 该节点未被送中 ->" +sCode)
                resolve("No")
                return
            }
        } else {
            return
        }
        }, reason => {
            if (sign==0) {
            ErrorList.push(pname)
            console.log(pname + ": 该节点检测失败")
            reject("Error")
        }
            return
        });
        })
    }

