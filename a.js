
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
var Chatgpt=[]
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
        console.log(" Chatgpt检测 ")
        console.log("节点or策略组："+pflag)

        if (pflag==1) {
        console.log("节点数量："+resolve.ret[policy]["candidates"].length)
	console.log("\n开始检测-----------------------------------")	

        if(resolve.ret[policy]["candidates"].length==0) {
            $done({"title":"Google Chatgpt检测","htmlMessage":`<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>😭 无有效节点</b>`});
        }
    }

       
        Check()
 
    }
}, reject => {
 
    $done();
});

function Len(cnt) {
    return cnt.length-1
}

function Check() {
    var relay = 2000;
    for ( var i=0;i < output.length;i++) {
        testChatGPT(output[i])
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
        relay =35000
    }
    console.log(output.length+":"+relay)
    setTimeout(() => {
	console.log("检测结束-------------------------------------")	    
        console.log("\n⛳️ 共计 "+Chatgpt.length+" 个节点未Chatgpt 👇 ")
         for (var i = 0; i < Chatgpt.length; i++) {
			console.log(Chatgpt[i]);
		}
	console.log("--------------------------------------------")	       
        console.log("\n🏠 共计 "+NoList.length+" 个已Chatgpt节点 👇 ")
           for (var i = 0; i < NoList.length; i++) {
			console.log(NoList[i]);
		}
	console.log("---------------------------------------------")	           
        console.log("\n🕹 共计 "+ErrorList.length+" 个检测出错节点 👇 ")
           for (var i = 0; i < ErrorList.length; i++) {
			console.log(ErrorList[i]);
		}
        sign=1
        if (Chatgpt[0] && pflag==1) { //有支持节点、且为策略组才操作
            ReOrder(Chatgpt)
            } else if (!Chatgpt[0]){ //不支持
                content =pflag==0 ? `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>😭 该节点已被 Google Chatgpt </b><br><br>👇<br><br><font color=#FF5733>-------------------------<br><b>⟦ `+policy+` ⟧ </b><br>-------------------------</font>`: `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "<br>❌  <b>⟦ "+policy+ " ⟧ </b>⚠️ 切换失败<br><br><b>该策略组内未找到未被 Google Chatgpt</b> 的节点" + "<br><br><font color=#FF5733>-----------------------------<br><b>检测详情请查看JS脚本记录</b><br>-----------------------------</font>"+`</p>`
                //为节点且检测超时/出错
                content = pflag==0 && Len(NoList)==0 ? content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>⚠️ 该节点 Google Chatgpt检测失败 </b><br><br>👇<br><br><font color=#FF5733>-------------------------<br><b>⟦ `+policy+` ⟧ </b><br>-------------------------</font>`: content
                $done({"title":"Google Chatgpt检测&切换", "htmlMessage": content})
            } else if (Chatgpt[0]){ //支持, 但为节点
            content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b> 🎉 该节点未被 Google Chatgpt </b><br><br>👇<br><br><font color=#FF5733>-------------------------<br><b>⟦ `+policy+` ⟧ </b><br>-------------------------</font>`
            $done({"title":"Google Chatgpt检测&切换", "htmlMessage": content})
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
      let inputStr = JSON.stringify(resolve.ret);
      console.log("------------------------------------------\n")
      console.log("\n节点延迟：");
      const json = JSON.parse(inputStr);
      const keys = Object.keys(json).sort();

      for (const key of keys) {
        console.log(`${key}: [${json[key].join(', ')}]`);
      }

      console.log("------------------------------------------\n")
   
     
      if (array) {
        try {
          array.sort(function (a, b) {
            //console.log(a+" VS "+b)
            return (resolve.ret[a][1] != -1 && resolve.ret[b][1] != -1) ? resolve.ret[a][1] - resolve.ret[b][1] : resolve.ret[b][1]
          })
        } catch (err) {
          console.log(err)
        }
      }
     
      console.log("------------------------------------------\n")
      let Ping = resolve.ret[array[0]]
      const dict = { [policy]: array[0] };
      if (array[0]) {
        console.log("未Chatgpt最优节点：" + array[0] + "    延迟最低  👉" + Ping)
        Ping = " ⚡️ 节点延迟 ➟ 「 " + Ping + " 」 "
        $notify("检测完成,当前最优节点👇", array[0] + "\n 👉 " + Ping)
        $done()
      }
    }
  }, reject => {
    // Normally will never happen.
    console.log(reject);
    $done();
  });
}




function testChatGPT(pname) {
  return new Promise((resolve, reject) =>{
	     console.log("paname="+pname)
    let option = {
      url: BASE_URL_GPT,
      opts: opts1,
      timeout: 2800,
    }
    $task.fetch(option).then(response=> {
      let resp = JSON.stringify(response)
      console.log("ChatGPT Main Test")
      let jdg = resp.indexOf("text/plain")
      if(jdg == -1) {
      let option1 = {
        url: Region_URL_GPT,
        opts: opts1,
        timeout: 2800,
      }
      $task.fetch(option1).then(response=> {
        console.log("ChatGPT Region Test")
        let region = response.body.split("loc=")[1].split("\n")[0]
        console.log("ChatGPT Region: "+region)
        let res = support_countryCodes.indexOf(region)
        if (res != -1) {
          result["ChatGPT"] = "<b>ChatGPT: </b>支持 "+arrow+ "⟦"+flags.get(region.toUpperCase())+"⟧ 🎉"
          console.log("支持 ChatGPT    这里是否有windows-1")
          resolve("支持 ChatGPT")
          return
        } else {
          result["ChatGPT"] = "<b>ChatGPT: </b>未支持 🚫"
          console.log("不支持 ChatGPT")
          resolve("不支持 ChatGPT")
          return
        }
      }, reason => {
        console.log("Check-Error"+reason)
        resolve("ChatGPT failed")
      })
    } else {
      result["ChatGPT"] = "<b>ChatGPT: </b>未支持 🚫"
      console.log("不支持 ChatGPT")
      resolve("不支持 ChatGPT")
    }
    }, reason => {
      console.log("ChatGPT-Error"+reason)
      resolve("ChatGPT failed")
    })})}
