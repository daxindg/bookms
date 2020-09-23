# 整个标题（）



## API

#### 获取借书列表

`GET /api/borrow/list`

- 描述: 根据 Session id 获取借书列表
- 响应 :
    ```js
    {
        ok: true, // status of operation
        data: [
            {
                bid: _, // book id
                stime: _, // start time
                ddl: _, // ddl
                status: _ // one of ['pending return', 'pending borrow', 'overtime', 'ok']
            },
            ...
        ]
    }
    ```

#### 获取待处理借书

`GET /api/borrow/pending`

- 描述: 获取待处理的借书操作
- 响应: 
    ```js
    {
        ok: true,
        data: [
            {
                uid: _, // user id
                bid: _, // book id
                time: _ // request time
            }
        ]
    }
    ```