function responseWrapper(req, res, next) {
    // 原始的res.json方法
    const originalJson = res.json;

    // 重写res.json方法
    res.json = function(data) {

        let response = {
            code: 20000, // 默认的成功状态码
            data: data,  // 响应的数据
            msg: ''      // 默认的消息
        };
        if(data.status === 'error') {
            response.code = 50000;
            response.data = null;
            response.msg = data.message;
        }
        // 如果data是Error对象，那么我们认为这是一个错误响应
        if (data instanceof Error) {
            response.code = 50000; // 可以设置为你的错误状态码
            response.data = null;
            response.msg = data.message;
        }

        // 调用原始的res.json方法返回处理后的响应
        originalJson.call(this, response);
    }

    // 调用下一个中间件
    next();
}

export default responseWrapper;