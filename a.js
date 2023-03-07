var policy = ($environment.executeType == 0 || $environment.executeType == "0" || $environment.executeType == "-1") ? GetPolicy($environment.sourcePath) : $environment.params;
console.log("策略组：" + policy);
function GetPolicy(cnt) {
    if (cnt && cnt.indexOf("#policy=") != -1) {
        return decodeURIComponent(cnt.split("#policy=")[1].trim());
    } else {
        return "自动选择";
    }
}
const message = {
    action: "get_customized_policy",
    content: policy
};

$configuration.sendMessage(message).then(resolve => {
    if (resolve.error) {
        console.log(resolve.error);
        $done();
    }
    if (resolve.ret) {
        
        output = (JSON.stringify(resolve.ret[message.content])) ? JSON.parse(JSON.stringify(resolve.ret[message.content]["candidates"])) : [policy];
        console.log(output);
		$done();
    }
}, reject => {
    $done();
});
async function testPolicies() {
  for (let policy of output) {
    try {
      await testChatGPT(policy);
    } catch (error) {
      console.log(error);
    }
  }
  $done();
}

async function testChatGPT(policy) {
  const message = {
    action: "get_customized_policy",
    content: policy,
  };

  try {
    const resolve = await $configuration.sendMessage(message);
    if (resolve.error) {
      console.log(resolve.error);
    } else if (resolve.ret) {
      const candidates = resolve.ret[message.content]?.candidates ?? [policy];
      for (let candidate of candidates) {
        const region = await getRegion();
        if (support_countryCodes.includes(region)) {
          console.log(`${candidate} 支持 ChatGPT`);
        } else {
          console.log(`${candidate} 不支持 ChatGPT`);
        }
      }
    }
  } catch (error) {
    console.log(`发送策略 ${policy} 失败：${error}`);
  }
}

async function getRegion() {
  const option = {
    url: Region_URL_GPT,
    opts: opts1,
    timeout: 2800,
  };
  const response = await $task.fetch(option);
  const region = response.body.split("loc=")[1].split("\n")[0];
  return region;
}

 
