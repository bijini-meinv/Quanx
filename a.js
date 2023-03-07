const support_countryCodes = ["T1", "tw"];

// 定义获取策略的函数


// 定义测试 ChatGPT 的函数
function testChatGPT() {
  const Region_URL_GPT = "http://v4.ipv6-test.com/api/myip.php";
  const opts1 = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
    },
  };
  return new Promise((resolve, reject) => {
    const option1 = {
      url: Region_URL_GPT,
      opts: opts1,
      timeout: 2800,
    };
    $task.fetch(option1).then(
      (response) => {
        const region = response.body.split("loc=")[1].split("\n")[0].toLowerCase();
        if (support_countryCodes.includes(region)) {
          console.log(region + " 支持 ChatGPT");
          resolve(true);
        } else {
          console.log(region + " 不支持 ChatGPT");
          resolve(false);
        }
      },
      (reason) => {
        console.log("ChatGPT-Error" + reason);
        resolve(false);
      }
    );
  });
}

// 获取策略组
const policy = "自动选择";

// 构造消息体
const message = {
  action: "get_customized_policy",
  content: policy,
};

// 发送消息并获取返回值
$configuration.sendMessage(message).then(
  (resolve) => {
    if (resolve.error) {
      console.log(resolve.error);
      $done();
    }
    if (resolve.ret) {
      // 获取策略组的候选节点数组
      const nodes = JSON.parse(JSON.stringify(resolve.ret[message.content]["candidates"]));
      if (nodes && nodes.length > 0) {
        // 遍历节点数组进行测试
        const promises = nodes.map((node) => {
          return testChatGPT().then((support) => {
            if (support) {
              console.log(node + " 支持 ChatGPT");
            } else {
              console.log(node + " 不支持 ChatGPT");
            }
          });
        });
        Promise.all(promises).then(() => {
          $done();
        });
      } else {
        console.log(policy + " 没有可用节点");
        $done();
      }
    }
  },
  (reject) => {
    console.log(reject);
    $done();
  }
);



support_countryCodes=["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"]

function testChatGPT() {
  return new Promise((resolve, reject) =>{

      let option1 = {
        url: Region_URL_GPT,
        opts: opts1,
        timeout: 2800,
      }
      $task.fetch(option1).then(response=> {
        console.log("ChatGPT Region Test")
        let region = response.body.split("loc=")[1].split("\n")[0]
        let res = support_countryCodes.indexOf(region)
        if (res != -1) {
          console.log(region+"   支持 ChatGPT")
          return
        } else {    
          console.log("不支持 ChatGPT")

          return
        }
      }, reason => {
        console.log("Check-Error"+reason)
      
      })
    } else {

      console.log("不支持 ChatGPT")
  
    }
    }, reason => {
      console.log("ChatGPT-Error"+reason)
      resolve("ChatGPT failed")
    })})}





上面一条分割线 请将上下两部份代码 结合起来，实现每个组策略的节点一个个去testChatGPT（）
