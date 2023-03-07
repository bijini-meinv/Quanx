

var policy = $environment.executeType == 0 || $environment.executeType == "0" || $environment.executeType == "-1"? GetPolicy($environment.sourcePath) : $environment.params

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

$configuration.sendMessage(message).then(resolve => {
    if (resolve.error) {
        console.log(resolve.error);
        $done()
    }
    if (resolve.ret) {
        console.log(JSON.stringify(resolve.ret)+"????????????????????????")
        output=JSON.stringify(resolve.ret[message.content])? JSON.parse(JSON.stringify(resolve.ret[message.content]["candidates"])) : [policy]
     

        }
    }
    
             console.log(output)
  
    }
}, reject => {

    $done();
});

}



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
      console.log("排序前: ")
      for (var i = 0; i < array.length; i++) {
        console.log(array[i]);
      }
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
      console.log("\n排序后: ")
      for (var i = 0; i < array.length; i++) {
        console.log(array[i]);
      }
      console.log("------------------------------------------\n")
      let Ping = resolve.ret[array[0]]
      const dict = { [policy]: array[0] };
      if (array[0]) {
        console.log("未送中最优节点：" + array[0] + "    延迟最低  👉" + Ping)
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

