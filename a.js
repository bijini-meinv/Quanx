const support_countryCodes = ["T1","XX","AL","DZ","AD","AO", "KR","TW","TZ","TL","GB"];



// 定义获取策略的函数
function getPolicy() {
  if (sourcePath && sourcePath.indexOf("#policy=") !== -1) {
    return decodeURIComponent(sourcePath.split("#policy=")[1].trim());
  } else {
    return "自动选择";
  }
}

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
const policy = getPolicy($environment.sourcePath, $environment.params);

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


