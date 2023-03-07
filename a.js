var policy = ($environment.executeType == 0 || $environment.executeType == "0" || $environment.executeType == "-1") ? GetPolicy($environment.sourcePath) : $environment.params;
//1
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
        console.log(JSON.stringify(resolve.ret) + "????????????????????????");
        output = (JSON.stringify(resolve.ret[message.content])) ? JSON.parse(JSON.stringify(resolve.ret[message.content]["candidates"])) : [policy];
        console.log(output);
    }
}, reject => {
    $done();
});
