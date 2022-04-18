const express = require('express');
const path = require('path');
const app = express();
app.get('/users', (req,res) => {
    res.json({
        success: true,
        data:{id:1,name:'zhangsan'}
    });
});
//使用静态文件中间件
app.use(express.static(path.join(__dirname,'dist')));
app.listen(8000);