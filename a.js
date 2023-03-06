// 指定要检查的策略组名称
var policyName = '自动选择';

// 指定要检查的地区列表
var regionsToCheck =["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"]

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
