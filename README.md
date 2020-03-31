# ajaxImageUpload
原创jQuery图片上传插件，支持批量上传、预览、删除、放大、上传数量、上传大小、追加方式配置以及上传前、上传中和上传后的回调函数。

如果您觉得对您有用的话，别忘了给点个赞哦^_^ ！

github:[github.com/gouguoyin/ajaxImageUpload](https://github.com/gouguoyin/ajaxImageUpload "github.com/gouguoyin/ajaxImageUpload")

gitee:[gitee.com/gouguoyin/ajaxImageUpload](https://gitee.com/gouguoyin/ajaxImageUpload "gitee.com/gouguoyin/ajaxImageUpload")

demo：[http://www.gouguoyin.cn/ajaxImageUpload/demo](http://www.gouguoyin.cn/ajaxImageUpload/demo)

###### 上传前
![演示截图](https://image-static.segmentfault.com/307/630/3076307501-5e7f37312c655)
###### 上传后
![演示截图](https://image-static.segmentfault.com/241/131/2411318232-5e7f373f1a8eb)


 **使用方法**
 
 **1、先引入jquery和插件的css和js，注意先引入jquery** 
 
```
<link href="./css/upload.min.css" type="text/css" rel="stylesheet" />
<script src="https://cdn.staticfile.org/jquery/3.1.0/jquery.min.js"></script>
<script src="./js/upload.min.js"></script>
```

 **2、HTML结构** 
```
<div class="upload-box1"></div>

<div class="upload-box2"></div>
```
 **3、插件配置**
 
```javascript
$(".upload-box1").ajaxImageUpload({
    fileInput: 'file1', //上传按钮名，即input[type=file]的name值
    ajaxUrl: './upload1.php', //上传的服务器地址
});

$(".upload-box2").ajaxImageUpload({
    fileInput: 'file2', //上传按钮名，即input[type=file]的name值
    ajaxUrl: './upload2.php', //上传的服务器地址
});
```

 **4、服务端处理** 

服务端处理没有特殊的限制，只要服务端接受file表单提交的数据处理后返回json格式数据，上传成功返回的json数据里必须含有code和src，其中code必须为200，src是上传后的图片url，上传失败返回的json数据里必须含有code和msg，其中code为错误码(不能是200)，msg为错误信息。

以./upload1.php为例
```php
$file = $_FILES["file1"]; // 要和配置里的fileInput保持一致
if(!isset($file['tmp_name']) || !$file['tmp_name']) {
    echo json_encode(['code' => 401, 'msg' => '没有文件上传']);
    return false;
}
if($file["error"] > 0) {
    echo json_encode(['code' => 402, 'msg' => $file["error"]]);
    return false;
}

$upload_path = dirname(__FILE__) . "/uploads/" . date('Ymd/');
$file_path   = "./uploads/" . date('Ymd/');

if(!is_dir($upload_path)){
    if(!mkdir($upload_path, 0777, true)){
        echo json_encode(array('code' => 403, 'msg' => '上传目录创建失败，请确认是否有操作权限'));
        return false;
    };
}

if(move_uploaded_file($file["tmp_name"], $upload_path.$file['name'])){
    echo json_encode(['code' => 200, 'src' => $file_path.$file['name']]);
    return true;
}else{
    echo json_encode(['code' => 404, 'msg' => '上传失败']);
    return false;
}
```

 **参数说明** 
 
| 配置项 | 配置说明 | 必选 | 默认值 |
| --- | --- | --- |  --- | 
| `fileInput` |  上传按钮名，即input[type=file]的name值 | 是 | |
| `ajaxUrl` | ajax请求地址 | 是 | | 
| `imageUrl` |  已上传的图片连接 | 否 | [] | 
| `ajaxData` |  额外携带的json数据 | 否 | {} | 
| `allowZoom` |  是否允许放大 | 否 |true | 
| `allowType` |  允许上传图片的类型 | 否 | ["gif", "jpeg", "jpg", "bmp", "png"] | 
| `maxNum` |  允许上传图片数量 | 否 | 3 | 
| `maxSize` |  允许上传图片的最大尺寸，单位M | 否 |2 | 
| `appendMethod` |  图片追加方式，before/after | 否 | before | 
| `before` |  上传前回调函数 | 否 | | 
| `success` |  单次上传成功回调函数 | 否 | | 
| `complete` |  全部上传成功回调函数 | 否 | | 
| `error` |  上传失败回调函数 | 否 | | 

## 更新日志

### 2020-03-30
* 解决图片名里含有多个.时图片格式验证失败的BUG
* 鼠标放在上传图标上时新增pointer鼠标样式
* 优化CSS样式，删除无用的样式

### 2020-03-28
* 解决allowZoom设置为false时无法删除图片的BUG
* 新增已上传图片配置参数imageUrl，该参数主要用于编辑时展示之前已经上传的图片
* 新增追加方式配置参数appendMethod，可以指定上传图片在已有图片前面追加还是后面追加

### 2020-03-25
* 重写CSS样式，CSS类名前加ggy_前缀，以防止CSS污染
* 解决同一个页面只能使用一次的BUG
* 解决同一个文件二次上传无效的BUG
* 解决上传图片验证失败后必须刷新页面才能重新上传的BUG
* 新增批量上传功能
* 新增批量上传成功回调函数complete，在所有图片上传成功后会触发

 **Todo List** 
 - [x] 批量上传
 - [x] 图片放大
 - [ ] 去掉jquery依赖
 - [ ] 裁剪压缩
 - [ ] 拖拽排序
 


