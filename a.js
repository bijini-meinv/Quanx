const support_countryCodes = ["T1","XX","AL","DZ","AD","AO", /*...省略部分内容...*/ , "KR","TW","TZ","TL","GB"];

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
        const output = (JSON.stringify(resolve.ret[message.content])) ? JSON.parse(JSON.stringify(resolve.ret[message.content]["candidates"])) : [policy];
        console.log(output);

        // 遍历output数组，对每个组策略的节点进行测试
        output.forEach((node) => {
            testChatGPT(node);
        });

        $done();
    }
}, reject => {
    $done();
});

function testChatGPT(node) {
    const option1 = {
        url: Region_URL_GPT,
        opts: opts1,
        timeout: 2800,
    };

    $task.fetch(option1).then(response => {
        console.log(`[${node}] ChatGPT Region Test`);
        const region = response.body.split("loc=")[1].split("\n")[0];
        const res = support_countryCodes.indexOf(region);
        if (res != -1) {
            console.log(`[${node}] ${region}   支持 ChatGPT`);
        } else {
            console.log(`[${node}] 不支持 ChatGPT`);
        }
    }, reason => {
        console.log(`[${node}] Check-Error: ${reason}`);
    });
}
