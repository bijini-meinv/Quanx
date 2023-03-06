// 指定要检查的策略组名称1
var policyName = '自动选择';

// 指定要检查的地区列表
var regionsToCheck = ["T1","XX","AL","DZ"];

// 检查一个地区是否支持 ChatGPT 的函数
function testChatGPT(region) {
  return new Promise((resolve, reject) => {
    var regionURL = 'https://example.com/your-region-api/' + region;
    var option = {
      url: regionURL,
      timeout: 2000,
    };
    $task.fetch(option).then(response => {
      var regionData = response.body;
      // 在这里解析响应并检查是否支持 ChatGPT
      var supportsChatGPT = true;
      resolve(supportsChatGPT);
    }, reason => {
      console.log('Error checking region ' + region + ': ' + reason.error);
      resolve(false);
    });
  });
}

// 获取指定策略组并遍历其中的节点
var policy = $policy.get(policyName);
if (policy) {
  (async function() {
    for (var i = 0; i < policy.proxies.length; i++) {
      var proxyName = policy.proxies[i];
      var proxy = $proxy.get(proxyName);
      var region = proxy.policy.metadata.region;
      if (regionsToCheck.includes(region)) {
        var supportsChatGPT = await testChatGPT(region);
        console.log(proxyName + ' in ' + region + (supportsChatGPT ? ' supports' : ' does not support') + ' ChatGPT');
      } else {
        console.log(proxyName + ' in ' + region + ' is not in the regions to check');
      }
    }
  })();
} else {
  console.log('Policy ' + policyName + ' not found');
}
